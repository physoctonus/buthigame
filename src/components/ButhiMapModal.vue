<template>
	<div class="modal" v-if="showMap" role="dialog" aria-modal="true" aria-labelledby="map-title">
		<button class="modal__backdrop" type="button" aria-label="Close map" @click="closeMapModal" />
		<section class="modal__dialog">
			<header class="modal__header">
				<div>
					<p class="eyebrow">Observation location</p>
					<h2 id="map-title">{{ formattedCoords }}</h2>
				</div>
				<button type="button" class="icon-button" aria-label="Close map" @click="closeMapModal">
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path d="M18 6 6 18" />
						<path d="m6 6 12 12" />
					</svg>
				</button>
			</header>

			<div id="mapid2" class="map"></div>
		</section>
	</div>
</template>

<script>
	import leaflet from "leaflet";

	export default {
		name: "ButhiMapModal",
		props: {
			lat: Number,
			lon: Number,
		},
		data() {
			return {
				showMap: false,
				mymap: null,
			};
		},
		computed: {
			formattedCoords() {
				if (!Number.isFinite(this.lat) || !Number.isFinite(this.lon)) return "Location unavailable";
				return `${this.lat.toFixed(3)}, ${this.lon.toFixed(3)}`;
			},
		},
		mounted() {
			this.emitInterface();
		},
		methods: {
			drawMap() {
				if (!Number.isFinite(this.lat) || !Number.isFinite(this.lon)) return;
				if (this.mymap) {
					this.mymap.remove();
					this.mymap = null;
				}

				this.mymap = leaflet.map("mapid2", {
					zoomControl: true,
					attributionControl: true,
				}).setView([this.lat, this.lon], 4);

				leaflet.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
					maxZoom: 18,
					attribution: "&copy; OpenStreetMap contributors",
				}).addTo(this.mymap);

				leaflet.marker([this.lat, this.lon]).addTo(this.mymap);
			},
			closeMapModal() {
				this.showMap = false;
				if (this.mymap) {
					this.mymap.remove();
					this.mymap = null;
				}
				document.querySelector("body").classList.remove("overflow-hidden");
			},
			async openMapModal() {
				this.showMap = true;
				document.querySelector("body").classList.add("overflow-hidden");
				await this.$nextTick();
			},
			emitInterface() {
				this.$emit("interface", {
					openMapModal: () => this.openMapModal(),
					drawMap: () => this.drawMap(),
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
		width: min(860px, 100%);
		padding: 18px;
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
		margin-bottom: 14px;

		h2 {
			margin: 3px 0 0;
			font-size: 1.2rem;
		}
	}

	.eyebrow {
		margin: 0;
		color: $accent-cool;
		font-size: 0.78rem;
		font-weight: $font-weight-bold;
		text-transform: uppercase;
	}

	.icon-button {
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

	.map {
		width: 100%;
		height: min(62vh, 560px);
		min-height: 360px;
		overflow: hidden;
		border: 1px solid $border-color;
		border-radius: 18px;
		background: $surface-soft;
	}
</style>
