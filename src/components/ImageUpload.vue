<template>
	<div class="flex">
		<div
			class="uploader"
			:style="titleImgUrl !== '../assets/aircraft.svg' ? { backgroundImage: 'url(' + titleImgUrl + ')' } : ''"
		>
			<q-btn
				round
				color="primary"
				icon="add"
				:v-show="!uploadDisabled"
				@click="() => $refs.titleUpload.pickFiles()"
			></q-btn>
			<q-circular-progress
				:value="uploadProgress"
				v-show="uploadDisabled"
				:indeterminate="uploadProgress === 100"
				show-value
				size="42px"
				color="primary"
				class="q-ma-md"
			>{{ uploadProgress }}%</q-circular-progress>
		</div>
		<q-uploader
			url=""
			label="Titelbild hochladen"
			accept=".jpg, image/*"
			style="max-width: 300px; display:none;"
			hide-upload-btn
			ref="titleUpload"
			:multiple="galeryImages"
			@added="fileAdded($event, galeryImages)"
		/>
	</div>
</template>

<script>
	import sharedMethods from "app/sharedMethods.js";
	import { storage } from "../firebaseInit.js";

	export default {
		props: {
			titleImgUrl: String,
			galeryImages: Boolean,
			TripId: String,
		},
		data() {
			return {
				uploadDisabled: false,
				uploading: false,
				uploadProgress: 0,
			};
		},
		methods: {
			/**
			 * call this from @added event from q-uploader
			 * @param galeryImages if its a galery or title upload
			 */
			fileAdded(event, galeryImages) {
				let files = event;
				let uploadIndex = 0;

				// disable another upload
				this.uploadDisabled = true;
				if (!galeryImages) {
					// delete current title img
					const fileRef = storage
						.ref()
						.child("Images/Roundtrips/" + this.TripId + "/Title/titleImg");
					fileRef.delete();
				}

				this.uploadNext(files, galeryImages, uploadIndex);

				if (this.$refs.titleUpload) this.$refs.titleUpload.reset();
				if (this.$refs.galeryUpload) this.$refs.galeryUpload.reset();
			},
			uploadNext(files, galeryImages, uploadIndex) {
				if (!this.uploading) {
					let length = 1;
					if (galeryImages) {
						this.$store.getters["images/getGaleryImgUrls"](this.TripId).length;
					}

					this.upload(
						files[uploadIndex],
						galeryImages,
						uploadIndex + length,
						uploadIndex === files.length - 1,
						files.length,
						uploadIndex
					).then(() => {
						this.uploading = false;
						uploadIndex++;

						if (uploadIndex < files.length) {
							this.uploadNext(files, galeryImages, uploadIndex);
						} else {
							this.uploadDisabled = false;
						}
					});
				}
			},
			upload(file, galeryImages, count, lastItem, absoluteFiles, uploadIndex) {
				this.uploading = true;
				let context = this;

				return new Promise((resolve) => {
					let imagePath = "Title/titleImg";

					if (galeryImages) {
						imagePath = "Galery/galeryImg" + count;
					}

					const fileRef = storage
						.ref()
						.child("Images/Roundtrips/" + context.TripId + "/" + imagePath);

					let uploadTask = fileRef.put(file);
					uploadTask.on(
						"state_changed",
						(snapshot) => {
							var progress = Math.round(
								(snapshot.bytesTransferred / snapshot.totalBytes) * 100
							);

							console.log("Upload is " + progress + "% done");

							context.uploadProgress = progress;
						},
						(error) => {
							console.log(error);

							sharedMethods.showErrorNotification(
								"Das Bild konnte nicht hochgeladen werden"
							);
							context.visible = false;
							context.titleUploadDisabled = false;
							resolve(false);
						},
						() => {
							// upload succesful
							sharedMethods.showSuccessNotification(
								"Bild " +
									(uploadIndex + 1) +
									" von " +
									absoluteFiles +
									" wurde erfolgreich hochgeladen"
							);

							if (lastItem) {
								context.visible = false;
								context.titleUploadDisabled = false;
							}

							fileRef.getDownloadURL().then(function (url) {
								if (galeryImages) {
									context.$emit("galeryImageAdded", url);
								} else {
									context.$emit("titleImageChanged", url);
								}
							});
							resolve(true);
						}
					);
				});
			},
		},
	};
</script>

<style scoped>
	.uploader {
		width: 150px;
		height: 150px;
		border: solid #d5d5d5 1px;
		border-radius: 4px;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		background-image: url("../assets/aircraft.svg");
		background-position: center;
		background-size: cover;
	}
</style>
