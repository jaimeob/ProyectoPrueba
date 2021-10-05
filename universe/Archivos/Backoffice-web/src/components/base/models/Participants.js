
module.exports = function (mongoose) {
	const SCHEMA_NAME = "Participants";

	const schema = mongoose.Schema({
		userId: Object,
		giveawayId: mongoose.Schema.Types.ObjectId,
		tickets: Array,
		status: Number,
		name: String,
		
	})
	
	schema.methods.hello = function(cb) {
		return 'world';
	}

	const Model = mongoose.models[SCHEMA_NAME] || mongoose.model(SCHEMA_NAME, schema);
	return Model;
}
