<template>
	<div class="modal" v-if="showGuide" role="dialog" aria-modal="true" aria-labelledby="guide-title">
		<button class="modal__backdrop" type="button" aria-label="Close guide" @click="closeGuideModal" />
		<section class="modal__dialog">
			<header class="modal__header">
				<div>
					<p class="eyebrow">How to play</p>
					<h2 id="guide-title">Practice by matching the target taxon.</h2>
				</div>
				<button type="button" class="icon-button" aria-label="Close guide" @click="closeGuideModal">
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path d="M18 6 6 18" />
						<path d="m6 6 12 12" />
					</svg>
				</button>
			</header>

			<ol class="steps">
				<li>Search for a class, order, family, genus, or iNaturalist taxon ID.</li>
				<li>Press Start, then choose the photo that matches the taxon shown at the top.</li>
				<li>After answering, review the names, map locations, and source observations.</li>
				<li>Use Family or Order mode when you want broader identification practice.</li>
			</ol>

			<footer class="modal__footer">
				<span>Developed by William Phillips</span>
				<button type="button" class="primary-button" @click="closeGuideModal">Start practicing</button>
			</footer>
		</section>
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
		inset: 0;
		z-index: $z-modal;
		display: grid;
		place-items: center;
		padding: 18px;
	}

	.modal__backdrop {
		position: fixed;
		inset: 0;
		border: 0;
		background: rgba(49, 39, 30, 0.34);
		backdrop-filter: blur(10px);
		cursor: pointer;
	}

	.modal__dialog {
		position: relative;
		width: min(620px, 100%);
		padding: 22px;
		background: $surface;
		border: 1px solid $border-color;
		border-radius: 22px;
		box-shadow: $shadow-lg;
		animation: scaleIn 180ms ease;
	}

	.modal__header {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 16px;

		h2 {
			margin: 3px 0 0;
			font-size: 1.45rem;
			line-height: 1.2;
		}
	}

	.eyebrow {
		margin: 0;
		color: $accent-primary;
		font-size: 0.78rem;
		font-weight: $font-weight-bold;
		text-transform: uppercase;
	}

	.steps {
		display: grid;
		gap: 12px;
		margin: 20px 0;
		padding-left: 22px;
		color: $text-secondary;
		line-height: 1.5;
	}

	.modal__footer {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		color: $text-muted;
		font-size: 0.88rem;
	}

	.icon-button,
	.primary-button {
		border: 0;
		cursor: pointer;
	}

	.icon-button {
		display: grid;
		place-items: center;
		width: 36px;
		height: 36px;
		color: $text-secondary;
		background: $surface-soft;
		border-radius: 50%;

		svg {
			width: 18px;
			height: 18px;
		}
	}

	.primary-button {
		min-height: 42px;
		padding: 0 16px;
		color: white;
		background: $text-primary;
		border-radius: 13px;
		font-weight: $font-weight-bold;
		white-space: nowrap;
	}

	@media (max-width: 520px) {
		.modal__footer {
			align-items: stretch;
			flex-direction: column;
		}
	}
</style>
