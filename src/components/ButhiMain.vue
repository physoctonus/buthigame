<template>
	<main class="game">
		<section v-if="$parent.apiResult" class="photo-grid" aria-label="Observation choices">
			<article
				v-for="card in cards"
				:key="card.id"
				class="choice-card"
				:class="{ correct: card.isCorrect, incorrect: card.isIncorrect, revealed: showingNames }"
				role="button"
				:tabindex="$parent.isDisabled ? -1 : 0"
				:aria-label="`Choose observation ${card.id}`"
				@click="handleCardClick(card.id)"
				@keydown.enter="handleCardClick(card.id)"
				@keydown.space.prevent="handleCardClick(card.id)"
			>
				<div class="photo-frame">
					<img :src="card.image" :alt="card.alt" class="choice-image" loading="eager">

					<div class="quick-actions">
						<button type="button" class="image-action" aria-label="Zoom image" @click.stop="openZoom(card)">
							<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
								<circle cx="11" cy="11" r="7" />
								<path d="m20 20-4-4" />
								<path d="M11 8v6" />
								<path d="M8 11h6" />
							</svg>
						</button>

						<button type="button" class="image-action" aria-label="View location" @click.stop="$parent.openMapModal(card.id)">
							<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
								<path d="M21 10c0 5.8-9 12-9 12S3 15.8 3 10a9 9 0 1 1 18 0Z" />
								<circle cx="12" cy="10" r="3" />
							</svg>
						</button>
					</div>

					<div class="result-badge" v-if="card.isCorrect || card.isIncorrect">
						<svg v-if="card.isCorrect" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6">
							<polyline points="20 6 9 17 4 12" />
						</svg>
						<svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6">
							<line x1="18" y1="6" x2="6" y2="18" />
							<line x1="6" y1="6" x2="18" y2="18" />
						</svg>
					</div>
				</div>

				<div class="choice-panel" v-if="showingNames" @click.stop>
					<div class="meta-row" v-if="$parent.anyOn">
						<span v-if="$parent.dateSwitchOn" class="meta-pill">{{ formatDate(card.date) }}</span>
						<span v-if="$parent.userSwitchOn" class="meta-pill">@{{ card.user }}</span>
					</div>

					<div class="answer-name" :class="{ correct: card.isCorrect, incorrect: card.isIncorrect }">
						{{ card.revealName }}
					</div>

					<div class="detail-actions" v-if="showingNames">
						<a :href="card.link" target="_blank" rel="noopener noreferrer" class="detail-button">
							<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
								<path d="M15 3h6v6" />
								<path d="M10 14 21 3" />
								<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
							</svg>
							<span>iNaturalist</span>
						</a>
					</div>
				</div>
			</article>
		</section>

		<section v-else class="empty-state" aria-label="Start screen">
			<img class="empty-mark" src="@/assets/scorpion-turtle.png" alt="" aria-hidden="true">
			<p>Search a taxon, then start a round.</p>
		</section>

		<div class="zoom-modal" v-if="zoomedCard" role="dialog" aria-modal="true" aria-label="Zoomed observation image">
			<button class="zoom-backdrop" type="button" aria-label="Close zoom" @click="closeZoom"></button>
			<div class="zoom-dialog">
				<header class="zoom-header">
					<span>Image preview</span>
					<button type="button" class="zoom-close" aria-label="Close zoom" @click="closeZoom">
						<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<path d="M18 6 6 18" />
							<path d="m6 6 12 12" />
						</svg>
					</button>
				</header>
				<img :src="zoomedCard.image" :alt="zoomedCard.alt" class="zoom-image">
			</div>
		</div>
	</main>
</template>

<script>
	export default {
		name: "ButhiMain",
		data() {
			return {
				showingNames: false,
				showingMaps: false,
				zoomedCard: null,
			};
		},
		computed: {
			cards() {
				return [
					this.getCard(1, "first"),
					this.getCard(2, "second"),
					this.getCard(3, "third"),
					this.getCard(4, "fourth"),
				];
			},
		},
		mounted() {
			this.emitInterface();
		},
		methods: {
			emitInterface() {
				this.$emit("interface", {
					showMaps: () => this.showMaps(),
					hideNames: () => this.hideNames(),
				});
			},
			getCard(id, key) {
				return {
					id,
					image: this.$parent[key],
					name: this.$parent[`${key}name`],
					date: this.$parent[`${key}Date`],
					user: this.$parent[`${key}User`],
					link: this.$parent[`${key}Link`],
					revealName: this.$parent[`${key}RevealName`] || this.$parent[`${key}name`],
					isCorrect: this.$parent[`${key}Win`],
					isIncorrect: this.$parent[`${key}Lose`],
					alt: `Observation choice ${id}`,
				};
			},
			showNames() {
				this.showingNames = true;
			},
			hideNames() {
				this.showingNames = false;
			},
			showMaps() {
				this.showingMaps = true;
			},
			hideMaps() {
				this.showingMaps = false;
			},
			openZoom(card) {
				this.zoomedCard = card;
				document.querySelector("body").classList.add("overflow-hidden");
			},
			closeZoom() {
				this.zoomedCard = null;
				document.querySelector("body").classList.remove("overflow-hidden");
			},
			handleCardClick(cardNum) {
				if (this.$parent.isDisabled) return;

				const keyByNumber = {
					1: "first",
					2: "second",
					3: "third",
					4: "fourth",
				};
				const key = keyByNumber[cardNum];
				const isCorrect = this.$parent[`${key}name`] === this.$parent.getFullName();

				this.hideMaps();
				this.$parent.isDisabled = true;
				this.$parent[`${key}Win`] = isCorrect;
				this.$parent[`${key}Lose`] = !isCorrect;

				this.showNames();
				this.$parent.incQuestions();
				if (isCorrect) this.$parent.score++;
				this.$parent.calcAcc();
			},
			formatDate(dateString) {
				if (!dateString) return "";
				const date = new Date(dateString);
				return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
			},
		},
	};
</script>

<style lang="scss" scoped>
	@import "@/assets/global.scss";

	.game {
		flex: 1;
		min-width: 0;
		min-height: 0;
		padding: 12px;
		background: $app-bg;
		overflow: hidden;
	}

	.photo-grid {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		grid-template-rows: repeat(2, minmax(0, 1fr));
		gap: 10px;
		height: 100%;
		min-height: 0;
	}

	.empty-state {
		height: 100%;
		min-height: 0;
		display: grid;
		place-items: center;
		align-content: center;
		gap: 14px;
		color: $text-muted;
		background: $surface-raised;
		border: 1px solid $border-color;
		border-radius: 22px;
		box-shadow: $shadow-sm;
	}

	.empty-mark {
		width: min(28vw, 150px);
		max-width: 170px;
		height: auto;
		filter: drop-shadow(0 12px 24px rgba(52, 45, 38, 0.12));
	}

	.empty-state p {
		margin: 0;
		font-weight: $font-weight-semibold;
	}

	.choice-card {
		display: grid;
		grid-template-rows: minmax(0, 1fr);
		min-height: 0;
		overflow: hidden;
		background: $surface;
		border: 1px solid $border-color;
		border-radius: 18px;
		box-shadow: $shadow-sm;
		cursor: pointer;
		outline: none;
		transition: border-color $transition-base, box-shadow $transition-base, transform $transition-base;

		&:hover {
			transform: translateY(-1px);
			box-shadow: $shadow-md;
		}

		&.correct {
			border-color: rgba(111, 143, 93, 0.58);
		}

		&.incorrect {
			border-color: rgba(181, 82, 69, 0.52);
		}

		&.revealed {
			grid-template-rows: minmax(0, 1fr) auto;
			cursor: default;
		}

		&:focus-visible {
			box-shadow: 0 0 0 4px rgba(143, 93, 61, 0.16), $shadow-md;
		}
	}

	.photo-frame {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 0;
		background: $surface-soft;
	}

	.choice-image {
		width: 100%;
		height: 100%;
		max-height: 100%;
		object-fit: cover;
		display: block;
	}

	.result-badge {
		position: absolute;
		top: 14px;
		right: 14px;
		display: grid;
		place-items: center;
		width: 42px;
		height: 42px;
		color: white;
		background: rgba(55, 45, 35, 0.78);
		border-radius: 50%;
		box-shadow: $shadow-md;

		svg {
			width: 24px;
			height: 24px;
		}
	}

	.quick-actions {
		position: absolute;
		top: 10px;
		left: 10px;
		z-index: 2;
		display: flex;
		gap: 6px;
		opacity: 1;
	}

	.image-action {
		display: grid;
		place-items: center;
		width: 36px;
		height: 36px;
		color: $text-primary;
		background: rgba(250, 246, 238, 0.82);
		border: 1px solid rgba(82, 65, 48, 0.14);
		border-radius: 50%;
		backdrop-filter: blur(16px);
		box-shadow: $shadow-sm;
		transition: opacity $transition-fast, transform $transition-fast, background $transition-fast;
		cursor: pointer;

		svg {
			width: 18px;
			height: 18px;
		}

		&:hover,
		&:focus-visible {
			transform: scale(1.04);
			background: $surface;
		}
	}

	.choice-panel {
		display: grid;
		gap: 7px;
		padding: 9px;
		background: rgba(250, 246, 238, 0.86);
		backdrop-filter: blur(18px);
		border-top: 1px solid $border-color;
	}

	.meta-row,
	.detail-actions {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 8px;
	}

	.meta-pill {
		color: $text-muted;
		background: $surface-soft;
		border-radius: 999px;
		padding: 4px 9px;
		font-size: 0.78rem;
		font-weight: 600;
	}

	.answer-name {
		border-radius: 12px;
		min-height: 38px;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 7px 12px;
		color: $text-primary;
		background: $surface-soft;
		font-weight: 700;
		font-style: italic;
		text-align: center;

		&.correct {
			color: white;
			background: $accent-success;
		}

		&.incorrect {
			color: white;
			background: $accent-error;
		}
	}

	.detail-button {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		min-height: 34px;
		padding: 0 10px;
		color: $text-secondary;
		background: transparent;
		border: 1px solid $border-color;
		border-radius: 10px;
		font: inherit;
		font-size: 0.85rem;
		font-weight: 650;
		text-decoration: none;
		cursor: pointer;

		svg {
			width: 16px;
			height: 16px;
		}

		&:hover {
			color: $text-primary;
			border-color: rgba(82, 65, 48, 0.22);
			background: $surface-soft;
		}
	}

	.zoom-modal {
		position: fixed;
		inset: 0;
		z-index: $z-modal;
		display: grid;
		place-items: center;
		padding: 18px;
	}

	.zoom-backdrop {
		position: fixed;
		inset: 0;
		border: 0;
		background: rgba(49, 39, 30, 0.68);
		backdrop-filter: blur(14px);
		cursor: zoom-out;
	}

	.zoom-dialog {
		position: relative;
		display: grid;
		grid-template-rows: auto minmax(0, 1fr);
		width: min(96vw, 1200px);
		height: min(92vh, 860px);
		overflow: hidden;
		background: rgba(250, 246, 238, 0.94);
		border: 1px solid rgba(250, 246, 238, 0.42);
		border-radius: 22px;
		box-shadow: $shadow-lg;
		animation: scaleIn 160ms ease;
	}

	.zoom-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		min-height: 52px;
		padding: 0 10px 0 18px;
		color: $text-secondary;
		font-weight: $font-weight-semibold;
	}

	.zoom-close {
		display: grid;
		place-items: center;
		width: 36px;
		height: 36px;
		color: $text-secondary;
		background: $surface-soft;
		border: 0;
		border-radius: 50%;
		cursor: pointer;

		svg {
			width: 18px;
			height: 18px;
		}
	}

	.zoom-image {
		width: 100%;
		height: 100%;
		min-height: 0;
		object-fit: contain;
		background: $surface-soft;
	}

	@media (max-width: 960px) {
		.game {
			padding: 8px;
			overflow: hidden;
		}

		.photo-grid {
			grid-template-columns: repeat(2, minmax(0, 1fr));
			grid-template-rows: repeat(2, minmax(0, 1fr));
			height: 100%;
		}

		.choice-card {
			min-height: 0;
			border-radius: 14px;
		}

		.choice-panel {
			padding: 7px;
			gap: 5px;
		}

		.answer-name {
			min-height: 38px;
			padding: 6px 8px;
			font-size: 0.84rem;
		}

		.meta-row,
		.detail-actions {
			gap: 5px;
		}

		.meta-pill,
		.detail-button {
			font-size: 0.72rem;
		}

		.detail-button {
			min-height: 28px;
			padding: 0 7px;
		}
	}

	@media (max-width: 520px) {
		.game {
			padding: 6px;
		}

		.photo-grid {
			gap: 6px;
		}

		.choice-card {
			border-radius: 12px;
		}

		.answer-name {
			min-height: 34px;
			font-size: 0.78rem;
		}

		.detail-actions,
		.meta-row {
			display: none;
		}

		.quick-actions {
			top: 7px;
			left: 7px;
			gap: 5px;
		}

		.image-action {
			width: 32px;
			height: 32px;
		}
	}
</style>
