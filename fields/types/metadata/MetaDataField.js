import ArrayFieldMixin from 'horizontec-keystone/fields/mixins/ArrayField';
import Field from 'horizontec-keystone/fields/types/Field';

module.exports = Field.create({

	displayName: 'MetaDataField',
	statics: {
		type: 'ObjectArray',
	},

	mixins: [ArrayFieldMixin],

	isValid (input) {
		return /^-?\d*\.?\d*$/.test(input);
	},

});
