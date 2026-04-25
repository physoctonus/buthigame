<template>
	<div class="modal" v-if="showWarn" role="dialog" aria-modal="true" aria-labelledby="warning-title">
		<button class="modal__backdrop" type="button" aria-label="Close warning" @click="closeWarnModal" />
		<section class="modal__dialog">
			<header class="modal__header">
				<div>
					<p class="eyebrow">Heads up</p>
					<h2 id="warning-title">This taxon has limited photos</h2>
				</div>
				<button type="button" class="icon-button" aria-label="Close warning" @click="closeWarnModal">
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path d="M18 6 6 18" />
						<path d="m6 6 12 12" />
					</svg>
				</button>
			</header>
			<p class="modal__body">
				There may not be enough high-quality observations to keep generating distinct choices.
				Try a broader taxon if rounds begin repeating.
			</p>
			<footer class="modal__footer">
				<button type="button" class="primary-button" @click="closeWarnModal">Got it</button>
			</footer>
		</section>
	</div>
</template>

<script>
	export default {
		name: "ButhiWarnModal",
		mounted() {
			this.emitInterface();
		},
		data() {
			return {
				showWarn: false,
			};
		},
		methods: {
			closeWarnModal() {
				this.showWarn = false;
				document.querySelector("body").classList.remove("overflow-hidden");
			},
			openWarnModal() {
				this.showWarn = true;
				document.querySelector("body").classList.add("overflow-hidden");
			},
			emitInterface() {
				this.$emit("interface", {
					openWarnModal: () => this.openWarnModal(),
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
		width: min(520px, 100%);
		padding: 20px;
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
			font-size: 1.35rem;
		}
	}

	.eyebrow {
		margin: 0;
		color: $accent-warm;
		font-size: 0.78rem;
		font-weight: $font-weight-bold;
		text-transform: uppercase;
	}

	.modal__body {
		margin: 14px 0 0;
		color: $text-secondary;
		line-height: 1.55;
	}

	.modal__footer {
		display: flex;
		justify-content: flex-end;
		margin-top: 18px;
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
	}
</style>
