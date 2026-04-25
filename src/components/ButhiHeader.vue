<template>
	<header class="header">
		<div class="brand">
			<div class="brand-mark" aria-hidden="true">B</div>
			<div>
				<div class="brand-name">ButhiGame</div>
				<div class="brand-subtitle">iNaturalist identification practice</div>
			</div>
		</div>

		<div class="prompt" :class="{ active: species && species !== 'species' }">
			<span class="prompt-label">Find</span>
			<span class="taxon-name">
				<span>{{ genus }}</span>
				<span v-if="species">{{ species }}</span>
				<span v-if="subspecies">{{ subspecies }}</span>
			</span>
		</div>

		<form class="search" @submit.prevent="checkInput">
			<label class="search-field">
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<circle cx="11" cy="11" r="8" />
					<path d="m21 21-4.35-4.35" />
				</svg>
				<input
					name="input"
					type="text"
					v-model="input"
					placeholder="Taxon name or ID"
					autocomplete="off"
				>
			</label>
			<button type="submit" class="search-button" :disabled="!input.trim() || $parent.isLoading">
				Search
			</button>
			<div class="status" :class="{ invalid: $parent.isInvalid }">
				<span></span>
				{{ $parent.isInvalid ? "Needs a valid taxon" : "Ready" }}
			</div>
		</form>
	</header>
</template>

<script>
	export default {
		name: "ButhiHeader",
		props: {
			genus: String,
			species: String,
			subspecies: String,
		},
		data() {
			return {
				input: "",
			};
		},
		methods: {
			async checkInput() {
				const query = this.input.trim();
				if (!query) return;

				this.$parent.apiResult = undefined;
				this.$parent.isInvalid = false;
				this.$parent.isLoading = true;

				const params = new URLSearchParams({ is_active: "any", per_page: "1" });
				if (/^\d+$/.test(query)) {
					params.set("taxon_id", query);
				} else {
					params.set("q", query);
				}

				try {
					const response = await fetch(`https://api.inaturalist.org/v1/taxa?${params.toString()}`);
					const data = await response.json();
					this.setQuery(data);
					this.$parent.onStart = 0;
					await this.$parent.setPages();
				} catch (error) {
					console.error("error", error);
					this.$parent.isInvalid = true;
				} finally {
					this.$parent.isLoading = false;
				}
			},
			setQuery(data) {
				const firstResult = data && data.results && data.results[0];
				if (!firstResult) {
					this.$parent.isInvalid = true;
					return;
				}

				this.$parent.query = firstResult.id;
				this.$parent.isInvalid = false;
			},
		},
	};
</script>

<style lang="scss" scoped>
	@import "@/assets/global.scss";

	.header {
		display: grid;
		grid-template-columns: minmax(190px, 0.8fr) minmax(220px, 1fr) minmax(340px, 1.2fr);
		align-items: center;
		gap: 14px;
		min-height: 64px;
		padding: 10px 14px;
		background: rgba(250, 246, 238, 0.88);
		border-bottom: 1px solid $border-color;
		backdrop-filter: blur(24px);
		position: sticky;
		top: 0;
		z-index: $z-sticky;
	}

	.brand {
		display: flex;
		align-items: center;
		gap: 12px;
		min-width: 0;
	}

	.brand-mark {
		display: grid;
		place-items: center;
		width: 38px;
		height: 38px;
		color: white;
		background: $accent-primary;
		border-radius: 12px;
		font-weight: $font-weight-bold;
	}

	.brand-name {
		font-size: 1rem;
		font-weight: $font-weight-bold;
	}

	.brand-subtitle {
		color: $text-muted;
		font-size: 0.78rem;
		white-space: nowrap;
	}

	.prompt {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 10px;
		min-width: 0;
		padding: 9px 14px;
		background: $surface-soft;
		border: 1px solid $border-color;
		border-radius: 16px;
	}

	.prompt-label {
		color: $text-muted;
		font-size: 0.78rem;
		font-weight: $font-weight-bold;
		text-transform: uppercase;
	}

	.taxon-name {
		display: flex;
		align-items: center;
		gap: 7px;
		min-width: 0;
		color: $text-primary;
		font-size: clamp(1rem, 2vw, 1.35rem);
		font-weight: $font-weight-semibold;
		font-style: italic;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.search {
		display: flex;
		align-items: center;
		justify-content: flex-end;
		gap: 10px;
		min-width: 0;
	}

	.search-field {
		display: flex;
		align-items: center;
		gap: 9px;
		min-width: 180px;
		flex: 1;
		height: 40px;
		padding: 0 13px;
		background: $surface-soft;
		border: 1px solid $border-color;
		border-radius: 14px;

		svg {
			width: 18px;
			height: 18px;
			color: $text-muted;
			flex: none;
		}

		input {
			width: 100%;
			min-width: 0;
			border: 0;
			outline: 0;
			background: transparent;
			color: $text-primary;
			font-size: 0.95rem;

			&::placeholder {
				color: $text-tertiary;
			}
		}

		&:focus-within {
			border-color: rgba(143, 93, 61, 0.38);
			box-shadow: 0 0 0 4px rgba(143, 93, 61, 0.12);
		}
	}

	.search-button {
		height: 40px;
		padding: 0 16px;
		border: 0;
		border-radius: 14px;
		color: white;
		background: $text-primary;
		font-weight: $font-weight-bold;
		cursor: pointer;

		&:hover:not(:disabled) {
			background: $accent-primary;
		}

		&:disabled {
			opacity: 0.42;
			cursor: default;
		}
	}

	.status {
		display: inline-flex;
		align-items: center;
		gap: 7px;
		color: $text-muted;
		font-size: 0.78rem;
		font-weight: $font-weight-semibold;
		white-space: nowrap;

		span {
			width: 8px;
			height: 8px;
			border-radius: 50%;
			background: $accent-success;
		}

		&.invalid span {
			background: $accent-error;
		}
	}

	@media (max-width: 1080px) {
		.header {
			grid-template-columns: minmax(160px, 0.7fr) minmax(180px, 1fr) minmax(260px, 1fr);
			gap: 8px;
		}

		.brand-subtitle,
		.status {
			display: none;
		}

		.search {
			justify-content: flex-end;
		}
	}

	@media (max-width: 860px) {
		.search {
			gap: 7px;
		}

		.search-field {
			min-width: 0;
		}

		.search-button {
			padding: 0 12px;
		}
	}

	@media (max-width: 760px) {
		.header {
			grid-template-columns: 1fr;
			gap: 6px;
			padding: 7px 10px;
		}

		.brand {
			display: none;
		}

		.prompt {
			justify-content: center;
			padding: 6px 10px;
			border-radius: 12px;
		}

		.taxon-name {
			font-size: 0.96rem;
		}

		.search-field {
			height: 36px;
		}

		.search-button {
			height: 36px;
		}
	}

	@media (max-width: 380px) {
		.search-button {
			padding: 0 10px;
			font-size: 0.84rem;
		}

		.search-field {
			padding: 0 10px;
		}
	}
</style>
