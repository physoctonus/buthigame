<template>
	<aside class="toolbar" aria-label="Game controls">
		<section class="panel primary-actions">
			<button type="button" class="control-button secondary" @click="openGuideModal">
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<circle cx="12" cy="12" r="10" />
					<path d="M12 16v-4" />
					<path d="M12 8h.01" />
				</svg>
				Guide
			</button>

			<button
				type="button"
				class="control-button primary"
				@click="start"
				v-if="!$parent.isStarted && !$parent.isLoading"
				:disabled="$parent.isInvalid || !$parent.query"
			>
				<svg viewBox="0 0 24 24" fill="currentColor">
					<path d="M8 5v14l11-7Z" />
				</svg>
				Start
			</button>

			<button
				type="button"
				class="control-button primary"
				@click="nextClick"
				v-if="$parent.isStarted && !$parent.isLoading"
			>
				<svg viewBox="0 0 24 24" fill="currentColor">
					<path d="M5 5v14l8-7Z" />
					<path d="M15 5h3v14h-3Z" />
				</svg>
				Next
			</button>

			<div class="loading" v-if="$parent.isLoading">
				<span class="spinner"></span>
				Loading observations
			</div>
		</section>

		<section class="panel">
			<h2>Practice Level</h2>
			<div class="segmented">
				<button
					type="button"
					:aria-pressed="!$parent.genusSwitchOn && !$parent.orderSwitchOn && !$parent.familySwitchOn"
					:class="{ active: !$parent.genusSwitchOn && !$parent.orderSwitchOn && !$parent.familySwitchOn }"
					@click="setMode('species')"
				>
					Species
				</button>
				<button type="button" :aria-pressed="$parent.genusSwitchOn" :class="{ active: $parent.genusSwitchOn }" @click="setMode('genus')">
					Genus
				</button>
				<button type="button" :aria-pressed="$parent.familySwitchOn" :class="{ active: $parent.familySwitchOn }" @click="setMode('family')">
					Family
				</button>
				<button type="button" :aria-pressed="$parent.orderSwitchOn" :class="{ active: $parent.orderSwitchOn }" @click="setMode('order')">
					Order
				</button>
			</div>
		</section>

		<section class="panel">
			<h2>Reveal With Answer</h2>
			<label class="switch-row">
				<span>Date</span>
				<input type="checkbox" :checked="$parent.dateSwitchOn" @change="toggleOption('date')">
			</label>
			<label class="switch-row">
				<span>Observer</span>
				<input type="checkbox" :checked="$parent.userSwitchOn" @change="toggleOption('user')">
			</label>
		</section>

		<section class="panel score-panel">
			<div class="score-row">
				<span>Score</span>
				<strong>{{ score }} / {{ totalQuestions }}</strong>
			</div>
			<div class="score-row">
				<span>Accuracy</span>
				<strong>{{ safeAccuracy }}%</strong>
			</div>
			<div class="meter" aria-hidden="true">
				<span :style="{ width: safeAccuracy + '%' }"></span>
			</div>
		</section>
	</aside>
</template>

<script>
	export default {
		name: "ButhiToolbar",
		props: {
			score: Number,
			totalQuestions: Number,
			acc: Number,
		},
		computed: {
			safeAccuracy() {
				return Number.isFinite(this.acc) ? this.acc : 0;
			},
		},
		methods: {
			syncRevealState() {
				this.$parent.anyOn = this.$parent.userSwitchOn || this.$parent.dateSwitchOn;
			},
			toggleOption(option) {
				if (option === "user") this.$parent.userSwitchOn = !this.$parent.userSwitchOn;
				if (option === "date") this.$parent.dateSwitchOn = !this.$parent.dateSwitchOn;
				this.syncRevealState();
			},
			setMode(mode) {
				this.$parent.genusSwitchOn = mode === "genus";
				this.$parent.orderSwitchOn = mode === "order";
				this.$parent.familySwitchOn = mode === "family";
			},
			openGuideModal() {
				this.$parent.openGuideModal();
			},
			start() {
				this.$parent.isStarted = true;
				this.$parent.nextClick();
			},
			nextClick() {
				this.$parent.nextClick();
			},
		},
	};
</script>

<style lang="scss" scoped>
	@import "@/assets/global.scss";

	.toolbar {
		width: $toolbar-width;
		padding: 12px;
		display: flex;
		flex-direction: column;
		gap: 10px;
		background: $app-bg;
		border-right: 1px solid $border-color;
		overflow-y: auto;
	}

	.panel {
		display: grid;
		gap: 9px;
		padding: 11px;
		background: $surface-raised;
		border: 1px solid $border-color;
		border-radius: 18px;
		box-shadow: $shadow-sm;

		h2 {
			margin: 0;
			color: $text-muted;
			font-size: 0.76rem;
			font-weight: $font-weight-bold;
			text-transform: uppercase;
			text-align: center;
		}
	}

	.primary-actions {
		gap: 10px;
	}

	.control-button {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		min-height: 38px;
		border: 0;
		border-radius: 13px;
		font-weight: $font-weight-bold;
		cursor: pointer;
		transition: transform $transition-fast, background $transition-fast, opacity $transition-fast;

		svg {
			width: 18px;
			height: 18px;
		}

		&:hover:not(:disabled) {
			transform: translateY(-1px);
		}

		&:disabled {
			opacity: 0.45;
			cursor: default;
		}

		&.primary {
			color: white;
			background: $accent-primary;
		}

		&.secondary {
			color: $text-primary;
			background: $surface-soft;
			border: 1px solid $border-color;
		}
	}

	.loading {
		display: flex;
		align-items: center;
		gap: 8px;
		color: $text-muted;
		font-size: 0.86rem;
		font-weight: $font-weight-semibold;
	}

	.spinner {
		width: 16px;
		height: 16px;
		border: 2px solid $dark-surface;
		border-top-color: $accent-primary;
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
	}

	.segmented {
		display: grid;
		grid-template-columns: 1fr;
		gap: 6px;
		padding: 4px;
		background: $surface-soft;
		border-radius: 14px;

		button {
			min-height: 34px;
			min-width: 0;
			padding: 0 6px;
			border: 0;
			border-radius: 10px;
			color: $text-muted;
			background: transparent;
			font-weight: $font-weight-bold;
			cursor: pointer;
			overflow: hidden;
			text-overflow: ellipsis;

			&.active {
				color: $text-primary;
				background: $surface;
				box-shadow: $shadow-sm;
			}
		}
	}

	.switch-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		color: $text-secondary;
		font-weight: $font-weight-semibold;
		min-width: 0;

		input {
			appearance: none;
			width: 42px;
			height: 26px;
			margin: 0;
			background: $dark-surface;
			border-radius: 999px;
			position: relative;
			cursor: pointer;
			transition: background $transition-fast;

			&::after {
				content: "";
				position: absolute;
				top: 3px;
				left: 3px;
				width: 20px;
				height: 20px;
				background: $surface;
				border-radius: 50%;
				box-shadow: 0 1px 3px rgba(0, 0, 0, 0.18);
				transition: transform $transition-spring;
			}

			&:checked {
				background: $accent-primary;
			}

			&:checked::after {
				transform: translateX(16px);
			}
		}
	}

	.score-panel {
		margin-top: auto;
	}

	.score-row {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: 10px;

		span {
			color: $text-muted;
			font-size: 0.86rem;
			font-weight: $font-weight-semibold;
		}

		strong {
			font-size: 1.1rem;
		}
	}

	.meter {
		height: 7px;
		overflow: hidden;
		background: $dark-surface;
		border-radius: 999px;

		span {
			display: block;
			height: 100%;
			max-width: 100%;
			background: $accent-primary;
			border-radius: inherit;
			transition: width $transition-slow;
		}
	}

	@media (max-width: 960px) {
		.toolbar {
			width: 100%;
			display: grid;
			grid-template-columns: minmax(120px, 0.9fr) minmax(190px, 1.25fr) minmax(150px, 1fr) minmax(120px, 0.9fr);
			padding: 7px;
			gap: 7px;
			border-right: 0;
			border-top: 1px solid $border-color;
			overflow: hidden;
		}

		.score-panel {
			margin-top: 0;
		}

		.panel {
			padding: 8px;
			gap: 7px;
			border-radius: 14px;

			h2 {
				display: none;
			}
		}

		.control-button {
			min-height: 34px;
			font-size: 0.82rem;
		}

		.segmented {
			grid-template-columns: repeat(4, 1fr);
			gap: 3px;
		}

		.segmented button {
			min-height: 30px;
			font-size: 0.72rem;
		}

		.switch-row {
			font-size: 0.78rem;
		}

		.score-row span {
			font-size: 0.74rem;
		}

		.score-row strong {
			font-size: 0.9rem;
		}
	}

	@media (max-width: 760px) {
		.toolbar {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}

		.segmented {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}

	@media (max-width: 520px) {
		.toolbar {
			grid-template-columns: 1fr 1fr;
			padding: 5px;
			gap: 5px;
		}

		.panel {
			padding: 6px;
			gap: 6px;
		}

		.switch-row {
			gap: 8px;
			font-size: 0.74rem;
		}

		.switch-row input {
			width: 34px;
			height: 21px;

			&::after {
				top: 2px;
				left: 2px;
				width: 17px;
				height: 17px;
			}

			&:checked::after {
				transform: translateX(13px);
			}
		}

		.segmented button {
			min-height: 28px;
			font-size: 0.68rem;
			padding: 0 4px;
		}

		.control-button {
			min-height: 31px;
			font-size: 0.76rem;
		}

		.score-row {
			gap: 6px;
		}

		.meter {
			height: 5px;
		}
	}
</style>
