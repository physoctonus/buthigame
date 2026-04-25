<template>
	<div class="container">
		<ButhiHeader :genus=genus :species=species :subspecies=subspecies />
		<div class="main-screen">
			<ButhiToolbar :score=score :acc=acc :totalQuestions=totalQuestions />
			<ButhiMain @interface="getMainInterface" />
		</div>
	</div>
	<ButhiGuideModal @interface="getGuideInterface" />
	<ButhiWarnModal @interface="getWarnInterface" />
	<ButhiMapModal	@interface="getMapInterface" :lat=lat :lon=lon />
</template>

<script>
	import ButhiHeader from "./components/ButhiHeader.vue";
	import ButhiToolbar from "./components/ButhiToolbar.vue";
	import ButhiWarnModal from "./components/ButhiWarnModal.vue";
	import ButhiGuideModal from "./components/ButhiGuideModal.vue";
	import ButhiMapModal from "./components/ButhiMapModal.vue";
	import ButhiMain from "./components/ButhiMain.vue";
	import { getObservations, getObservationCount } from "./services/inaturalist";

	export default {
		name: "App",
		components: {
			ButhiHeader,
			ButhiToolbar,
			ButhiWarnModal,
			ButhiGuideModal,
			ButhiMapModal,
			ButhiMain,
		},
		data() {
			return {
				url_base: "https://api.inaturalist.org/v1/",
				apiResult: undefined,
				orderResult: undefined,
				query: "",

				anyOn: false,
				dateSwitchOn: false,
				userSwitchOn: false,
				genusSwitchOn: false,
				orderSwitchOn: false,
				familySwitchOn: false,

				score: 0,
				totalQuestions: 0,
				acc: 0,

				isStarted: false,
				isLoading: false,
				isInvalid: false,
				onStart: 0,

				genus: "Genus",
				species: "species",
				subspecies: undefined,

				names: [],

				firstname: "",
				secondname: "",
				thirdname: "",
				fourthname: "",

				firstRevealName: "",
				secondRevealName: "",
				thirdRevealName: "",
				fourthRevealName: "",

				firstOrder: "",
				secondOrder: "",
				thirdOrder: "",
				fourthOrder: "",

				firstFamily: "",
				secondFamily: "",
				thirdFamily: "",
				fourthFamily: "",

				first: "https://i.imgur.com/hs8VDXc.jpg",
				second: "https://i.imgur.com/gKFhqMb.jpeg",
				third: "https://i.imgur.com/NQB7xH8.jpg",
				fourth: "https://i.imgur.com/oMWs9ae.jpeg",

				firstDate: "",
				secondDate: "",
				thirdDate: "",
				fourthDate: "",

				firstUser: "",
				secondUser: "",
				thirdUser: "",
				fourthUser: "",

				firstLink: "",
				secondLink: "",
				thirdLink: "",
				fourthLink: "",

				firstWin: false,
				secondWin: false,
				thirdWin: false,
				fourthWin: false,

				firstLose: false,
				secondLose: false,
				thirdLose: false,
				fourthLose: false,

				firstPageNum: 1,
				secondPageNum: 1,
				thirdPageNum: 1,
				fourthPageNum: 1,
				
				firstCoords: [],
				secondCoords: [],
				thirdCoords: [],
				fourthCoords: [],

				perpage: 10,
				pageCount: 1,

				timesExecuted: 0,
				isDisabled: true,
				lat: 0,
				lon: 0,
						};
		},
		methods: {
			changePic() {
				if (this.timesExecuted < 300) {
					this.timesExecuted++;
					const selectedObservations = this.selectRoundObservations();
					if (selectedObservations.length < 4) {
						return this.changePic();
					}

					this.setRoundObservation("first", selectedObservations[0]);
					this.setRoundObservation("second", selectedObservations[1]);
					this.setRoundObservation("third", selectedObservations[2]);
					this.setRoundObservation("fourth", selectedObservations[3]);
				} else {
					this.timesExecuted = 0;
					this.warn();
				}
			},
			async nextClick() {
			await this.setPages();
			await this.fetchScorpions();

			if (this.apiResult !== undefined) {
				this.subspecies = undefined;
				this.species = undefined;
				this.hideNames();
				this.changePic();
				this.setNames();
				var guess = this.getOneName();
					this.genus = guess.split(" ")[0];
					this.species = guess.split(" ")[1];
					if (guess.split(" ").length > 2) {
					this.subspecies = guess.split(" ")[2];
					}
				
				this.showMaps();

				this.firstWin = false;
				this.secondWin = false;
				this.thirdWin = false;
				this.fourthWin = false;

				this.firstLose = false;
				this.secondLose = false;
				this.thirdLose = false;
				this.fourthLose = false;

				this.isDisabled = false;
			}
			},
			randomPage() {
			return Math.floor(Math.random() * this.pageCount) + 1;
			},
			async fetchScorpions() {
			if (this.onStart === 0) this.isLoading = true;
			
			// Use the improved API service with proper parameters
			const fetchPromises = Array(4).fill(null).map(() => 
				getObservations({
					taxonId: this.query,
					page: this.randomPage(),
					perPage: this.perpage
				})
			);
			
			try {
				const responses = await Promise.all(fetchPromises);
				this.setResults(responses);
				if (this.onStart === 0) this.isLoading = false;
				this.onStart = 1;
			} catch (err) {
				console.error("error", err);
				this.isLoading = false;
			}
			},
			async setPages() {
			try {
				const count = await getObservationCount(this.query);
				
				if (count < 10) {
					this.isInvalid = true;
				}
				if (Math.round(count / this.perpage) > 1000) {
					this.pageCount = 1000;
				} else {
					this.pageCount = Math.round(count / this.perpage);
				}

				if (this.pageCount === 0) {
					this.isInvalid = true;
				}
			} catch (error) {
				console.error("error" + error);
			}
			},
			incQuestions() {
				this.totalQuestions++;
			},
			getPracticeMode() {
				if (this.orderSwitchOn) return "order";
				if (this.familySwitchOn) return "family";
				if (this.genusSwitchOn) return "genus";
				return "species";
			},
			getObservationPool() {
				if (!this.apiResult) return [];
				return this.apiResult.flatMap((response) => response.results || []);
			},
			shuffle(items) {
				return [...items].sort(() => Math.random() - 0.5);
			},
			selectRoundObservations() {
				const mode = this.getPracticeMode();
				const candidates = this.shuffle(this.getObservationPool())
					.map((observation) => this.createRoundCandidate(observation, mode))
					.filter(Boolean);

				const uniqueSelections = [];
				const seenAnswers = new Set();
				candidates.forEach((candidate) => {
					if (uniqueSelections.length >= 4) return;
					if (seenAnswers.has(candidate.answerName)) return;
					seenAnswers.add(candidate.answerName);
					uniqueSelections.push(candidate);
				});

				if (uniqueSelections.length >= 4) return uniqueSelections;

				const fallbackSelections = [];
				const seenObservationIds = new Set();
				candidates.forEach((candidate) => {
					if (fallbackSelections.length >= 4) return;
					if (seenObservationIds.has(candidate.observation.id)) return;
					seenObservationIds.add(candidate.observation.id);
					fallbackSelections.push(candidate);
				});
				return fallbackSelections;
			},
			createRoundCandidate(observation, mode) {
				if (!observation || !observation.taxon || !observation.photos || !observation.photos[0]) return null;

				const speciesName = observation.taxon.name;
				const answerName = this.getAnswerName(observation, mode);
				if (!speciesName || !answerName) return null;

				return {
					observation,
					answerName,
					revealName: mode === "species" ? speciesName : `${answerName}: ${speciesName}`,
				};
			},
			getAnswerName(observation, mode) {
				if (mode === "species") return observation.taxon.name;
				if (mode === "genus") return this.getRankName(observation, "genus") || observation.taxon.name.split(" ")[0];
				return this.getRankName(observation, mode);
			},
			getRankName(observation, rank) {
				const taxon = observation.taxon || {};
				if (taxon.rank === rank) return taxon.name;

				const ancestor = (taxon.ancestors || []).find((item) => item.rank === rank);
				if (ancestor) return ancestor.name;

				const identifications = observation.identifications || [];
				for (let i = 0; i < identifications.length; i++) {
					const identifiedTaxon = identifications[i].taxon || {};
					if (identifiedTaxon.rank === rank) return identifiedTaxon.name;
					const match = (identifiedTaxon.ancestors || []).find((item) => item.rank === rank);
					if (match) return match.name;
				}

				return "";
			},
			setRoundObservation(key, candidate) {
				const observation = candidate.observation;
				this[key] = this.getMedium(observation.photos[0].url);
				this[`${key}name`] = candidate.answerName;
				this[`${key}RevealName`] = candidate.revealName;
				this[`${key}Date`] = observation.observed_on;
				this[`${key}User`] = observation.user ? observation.user.login : "";
				this[`${key}Link`] = observation.uri;
				this[`${key}Coords`] = this.parseCoords(observation.location);
			},
			parseCoords(location) {
				if (!location) return [];
				return location.replace(/,/g, " ").split(" ").filter(Boolean);
			},
			calcAcc() {
				if (this.totalQuestions === 0) {
					this.acc = 0;
					return;
				}
				this.acc = Math.round(((this.score / this.totalQuestions) * 100) * 100) / 100;
			},
			setNames() {
				this.names[0] = this.firstname;
				this.names[1] = this.secondname;
				this.names[2] = this.thirdname;
				this.names[3] = this.fourthname;
			},
			setResults(results) {
				this.apiResult = results;
			},

			getRandomPageObsNums() {
				var randoms = [];
				while (randoms.length < 4) {
					var r = Math.floor(Math.random() * this.perpage);
					if (randoms.indexOf(r) === -1) randoms.push(r);
				}
				this.firstPageNum = randoms[0];
				this.secondPageNum = randoms[1];
				this.thirdPageNum = randoms[2];
				this.fourthPageNum = randoms[3];
			},
			getOneName() {
				var randomNum = Math.floor(Math.random() * 4);
				return this.names[randomNum];
			},
			getFullName() {
				if (this.species === undefined) {
					return this.genus;
				}
				if (this.subspecies === undefined) {
					return this.genus + " " + this.species;
				} else {
					return this.genus + " " + this.species + " " + this.subspecies;
				}
			},
			getMedium(string) {
				var newString = string.replace(/square|small|medium/g, "large");
				return newString;
			},
			getWarnInterface(warnInterface) {
				this.$options.warnInterface = warnInterface;
			},
			getGuideInterface(guideInterface) {
				this.$options.guideInterface = guideInterface;
			},
			getMainInterface(mainInterface) {
				this.$options.mainInterface = mainInterface;
			},
			getMapInterface(mapInterface) {
				this.$options.mapInterface = mapInterface;
			},
			showMaps() {
				this.$options.mainInterface.showMaps();
			},
			hideNames() {
				this.$options.mainInterface.hideNames();
			},
			warn() {
				this.$options.warnInterface.openWarnModal();
			},
			openGuideModal() {
				this.$options.guideInterface.openGuideModal();
			},
			async openMapModal(selected) {
				switch(selected) {
					case 1:
						this.lat = parseFloat(this.firstCoords[0]);
						this.lon = parseFloat(this.firstCoords[1]);
						await this.$options.mapInterface.openMapModal();
						this.drawMap();
						break;
					case 2:
						this.lat = parseFloat(this.secondCoords[0]);
						this.lon = parseFloat(this.secondCoords[1]);
						await this.$options.mapInterface.openMapModal();
						this.drawMap();
						break;	
					case 3:
						this.lat = parseFloat(this.thirdCoords[0]);
						this.lon = parseFloat(this.thirdCoords[1]);
						await this.$options.mapInterface.openMapModal();
						this.drawMap();
						break;
					case 4:
						this.lat = parseFloat(this.fourthCoords[0]);
						this.lon = parseFloat(this.fourthCoords[1]);
						await this.$options.mapInterface.openMapModal();
						this.drawMap();
						break;
					default:
						console.log("error")
				}
			},
			drawMap() {
					this.$options.mapInterface.drawMap();

			}
		},
		warnInterface: {
			openWarnModal: () => {},
		},
		guideInterface: {
			openGuideModal: () => {},
		},
		mainInterface: {
			hideNames: () => {},
			showMaps: () => {},
		},
		mapInterface: {
			openMapModal: () => {},
			drawMap: () => {},
		},
	};
</script>


<style lang="scss">
	@import "@/assets/global.scss";

	body {
		margin: 0;
		padding: 0;
		min-height: 100vh;
		background-color: $app-bg;
	}

	.container {
		display: flex;
		flex-direction: column;
		height: 100vh;
		overflow: hidden;
	}

	.main-screen {
		display: flex;
		flex: 1;
		min-height: calc(100vh - #{$header-height});
		min-height: 0;
		overflow: hidden;
	}

	@media (max-width: 960px) {
		.main-screen {
			flex-direction: column-reverse;
			min-height: 0;
		}
	}
</style>
