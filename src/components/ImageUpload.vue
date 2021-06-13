<template>
  <div class="flex">
    <div
      class="uploader"
      :style="{ backgroundImage: 'url(' + titleImgUrl + ')' }"
    >
      <q-btn
        round
        color="primary"
        icon="add"
        @click="() => $refs.titleUpload.pickFiles()"
      ></q-btn>
    </div>
    <q-uploader
      url=""
      label="Titelbild hochladen"
      accept=".jpg, image/*"
      style="max-width: 300px; display:none;"
      hide-upload-btn
      ref="titleUpload"
      @added="fileAdded($event)"
    />
  </div>
</template>

<script>
import sharedMethods from "app/sharedMethods";
export default {
  methods: {
    /**
     * call this from @added event from q-uploader
     * @param kind if its a galery or title upload
     */
    fileAdded(event, kind, roundtripDocId) {
      let files = event;
      let uploadIndex = 0;

      // disable another upload
      if (kind === "galery") this.visible = true;
      else {
        this.titleUploadDisabled = true;

        // delete current title img
        this.$store.dispatch("images/deleteTitleImg", roundtripDocId);
      }

      this.uploadNext(files, kind, uploadIndex, roundtripDocId);

      if (this.$refs.titleUpload) this.$refs.titleUpload.reset();
      if (this.$refs.galeryUpload) this.$refs.galeryUpload.reset();
    },
    uploadNext(files, kind, uploadIndex, roundtripDocId) {
      if (!this.uploading) {
        let length = this.$store.getters["images/getGaleryImgUrls"](
          roundtripDocId
        ).length;
        this.upload(
          files[uploadIndex],
          kind,
          uploadIndex + length,
          uploadIndex === files.length - 1,
          files.length,
          uploadIndex,
          roundtripDocId
        ).then(() => {
          this.uploading = false;
          uploadIndex++;
          if (uploadIndex < files.length)
            this.uploadNext(files, kind, uploadIndex);
        });
      }
    },
    upload(
      file,
      kind,
      count,
      lastItem,
      absoluteFiles,
      uploadIndex,
      roundtripDocId
    ) {
      this.uploading = true;

      return new Promise(resolve => {
        let kindPath = "Title/titleImg";
        if (kind === "galery") {
          kindPath = "Galery/galeryImg" + count;
        }
        const fileRef = storage
          .ref()
          .child("Images/Roundtrips/" + roundtripDocId + "/" + kindPath);

        let uploadTask = fileRef.put(file);
        uploadTask.on(
          "state_changed",
          snapshot => {
            var progress = Math.round(
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100
            );
            console.log(
              "Upload is " +
                (snapshot.bytesTransferred / snapshot.totalBytes) * 100 +
                "% done"
            );
            this.$store.commit("images/setUploadProgress", progress);
          },
          error => {
            console.log(error);

            sharedMethods.showErrorNotification(
              "Das Bild konnte nicht hochgeladen werden"
            );
            this.visible = false;
            this.titleUploadDisabled = false;
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
              this.visible = false;
              this.titleUploadDisabled = false;
            }
            fileRef.getDownloadURL().then(function(url) {
              if (kind === "galery") {
                this.$store.commit("images/addGaleryImg", {
                  newUrl: url,
                  RTId: roundtripDocId
                });
                this.$emit("imageAdded", url);
              } else if (kind === "title") {
                this.$store.commit("images/setTitleImg", {
                  newUrl: url,
                  RTId: roundtripDocId
                });
              }
            });
            resolve(true);
          }
        );
      });
    }
  }
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
