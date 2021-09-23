<template>
	<q-page class="q-px-lg">
		<q-input
			label="Title"
			v-model="title"
		></q-input>
		<q-editor
			placeholder="Description"
			v-model="description"
			:toolbar="[
        [
          {
            label: $q.lang.editor.align,
            icon: $q.iconSet.editor.align,
            fixedLabel: true,
            list: 'only-icons',
            options: ['left', 'center', 'right', 'justify']
          },
          {
            label: $q.lang.editor.align,
            icon: $q.iconSet.editor.align,
            fixedLabel: true,
            options: ['left', 'center', 'right', 'justify']
          }
        ],
        ['bold', 'italic', 'strike', 'underline', 'subscript', 'superscript'],
        ['token', 'hr', 'link', 'custom_btn'],
        ['print', 'fullscreen'],
        [
          {
            label: $q.lang.editor.formatting,
            icon: $q.iconSet.editor.formatting,
            list: 'no-icons',
            options: [
              'p',
              'h1',
              'h2',
              'h3',
              'h4',
              'h5',
              'h6',
              'code'
            ]
          },
          {
            label: $q.lang.editor.fontSize,
            icon: $q.iconSet.editor.fontSize,
            fixedLabel: true,
            fixedIcon: true,
            list: 'no-icons',
            options: [
              'size-1',
              'size-2',
              'size-3',
              'size-4',
              'size-5',
              'size-6',
              'size-7'
            ]
          },
          'removeFormat'
        ],
        ['quote', 'unordered', 'ordered', 'outdent', 'indent'],

        ['undo', 'redo'],
        ['viewsource']
      ]"
		></q-editor>
		<q-input
			type="url"
			label="Url"
			v-model="url"
		></q-input>
		notifications, warning, update
		<q-input
			label="Icon"
			v-model="icon"
		></q-input>
		<q-toggle
			label="Send to me"
			v-model="selfSend"
		></q-toggle>
		<br>
		<q-btn
			label="Senden"
			@click="sendMessage()"
		></q-btn>
	</q-page>
</template>

<script>
	import Message from "src/classes/message";
	import { db } from "src/firebaseInit";
	export default {
		data() {
			return {
				title: "",
				description: "",
				url: "",
				icon: "",
				selfSend: true,
			};
		},
		methods: {
			sendMessage() {
				const message = new Message(
					this.title,
					this.description,
					this.icon,
					this.url,
					new Date(Date.now())
				);

				if (this.selfSend) {
					this.$store.dispatch("user/appendUserMessage", message);
				} else {
					let roundtripsRef = db.collection("User");

					roundtripsRef.get().then((snapshot) => {
						snapshot.forEach((doc) => {
							db.collection("User")
								.doc(doc.id)
								.update({ messages: [message.toObject()] });
						});
					});
				}
			},
		},
	};
</script>

<style>
</style>