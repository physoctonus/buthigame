<template>
	<div class="modal" v-if="showGuide">
		<div class="modal__backdrop" @click=" closeGuideModal() " />
		<div class="modal__dialog">
			<div class="modal__body">
				<ul>
					<li>Type any taxa besides species in the input (class, family, genus)</li>
					<li>Click 'get' button and make sure the text says valid</li>
					<li>Start</li>
					<li>Wait for loading to finish, then click next</li>
					<li>For unclear photos, press next to skip</li>
					<li>Use iNaturalist taxon id's if dealing with duplicate taxonomy</li>
					<li>Practice your identification skills and enjoy!</li>
				</ul>
			</div>
			<div class="modal__footer">
				<p>Developed by William Phillips</p>
				<button type="button" class="modal__close" @click="closeGuideModal()">
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 352 512">
						<path fill="currentColor" d="M242.72 256l100.07-100.07c12.28-12.28 12.28-32.19 0-44.48l-22.24-22.24c-12.28-12.28-32.19-12.28-44.48 0L176 189.28 75.93 89.21c-12.28-12.28-32.19-12.28-44.48 0L9.21 111.45c-12.28 12.28-12.28 32.19 0 44.48L109.28 256 9.21 356.07c-12.28 12.28-12.28 32.19 0 44.48l22.24 22.24c12.28 12.28 32.2 12.28 44.48 0L176 322.72l100.07 100.07c12.28 12.28 32.2 12.28 44.48 0l22.24-22.24c12.28-12.28 12.28-32.19 0-44.48L242.72 256z"></path>
					</svg>
				</button>
			</div>
		</div>
	</div>
</template>

<script>
	export default {
	name: "ButhiGuideModal",
	mounted() {
		this.emitInterface();
	},
	data() {
		return {
		showGuide: false,
		};
	},
	methods: {
		closeGuideModal() {
		this.showGuide = false;
		document.querySelector("body").classList.remove("overflow-hidden");
		},
		openGuideModal() {
		this.showGuide = true;
		document.querySelector("body").classList.add("overflow-hidden");
		},
		emitInterface() {
		this.$emit("interface", {
			openGuideModal: () => this.openGuideModal(),
		});
		},
	},
	};
</script>

<style lang="scss" scoped>
	@import "@/assets/global.scss";

	.modal {
	position: fixed;
	top: 0;
	right: 0;
	bottom: 0;
	left: 0;
	z-index: 9;
	overflow-x: hidden;
	overflow-y: auto;
	&__backdrop {
		position: fixed;
		top: 0;
		right: 0;
		bottom: 0;
		left: 0;
		background-color: rgba(0, 0, 0, 0.3);
		z-index: 1;
	}
	&__dialog {
		position: relative;
		width: 600px;
		background-color: $dark4;
		color: $light2;
		font-family: "Andale Mono", monospace;
		border-radius: 5px;
		margin: 50px auto;
		display: flex;
		flex-direction: column;
		z-index: 2;
		@media screen and (max-width: 992px) {
		width: 90%;
		}
	}
	&__close {
		width: 30px;
		height: 30px;
		background-color: $light2;
		border: none;
		border-radius: 4px;
		transition: 0.1s;
		cursor: pointer;
	}
	&__close:hover {
		border: 2px solid $dark4;
	}
	&__close:active {
		border: 4px solid $dark4;
	}

	&__header {
		font-size: 40px;
		display: flex;
		align-items: flex-end;
		justify-content: flex-end;
		padding: 20px 20px 10px;
	}
	&__body {
		font-size: 19px;
		padding: 10px 20px 10px;
		overflow: auto;
		display: flex;
		flex-direction: column;
		align-items: stretch;
		li {
		margin: 10px 0;
		}
	}
	&__footer {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 10px 20px 20px;
	}
	}
	.fade-enter-active,
	.fade-leave-active {
	transition: opacity 0.2s;
	}
	.fade-enter,
	.fade-leave-to {
	opacity: 0;
	}
</style>
