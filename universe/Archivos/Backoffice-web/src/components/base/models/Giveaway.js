
const Constants = Object.freeze({
	Status: {
		INACTIVE: 0,
		ACTIVE: 1,
		CLOSED: 2,
		ENDED: 3,
		0: "Inactivo",
		1: "Activo",
		2: "Cerrado",
		3: "Finalizado",
	}
});

const defaultModel = function (mongoose) {

	const SCHEMA_NAME = "Giveaway";

	const schema = new mongoose.Schema({
		name: String,
		startDate: Date,
		finishDate: Date,
		description: String,
		cover: Object,
		requiredLogin: Boolean,
		createdBy: String,
		createdAt: Date,
		status: Number,
		countDownStart: Boolean,
		countDownEnd: Boolean,
		requiredTicket: Boolean,
		winner: Array,
		maxTicket: Number,
		path: String,
		instances: Array,
		minimumAmount: Number,
		minimumRequired: Boolean,
		totalWinners: Number,
		termsOfService: String
	})

	schema.statics.Constants = Constants;

	const Model = mongoose.models[SCHEMA_NAME] || mongoose.model(SCHEMA_NAME, schema);
	return Model;
}

defaultModel.Constants = Constants;
module.exports = defaultModel