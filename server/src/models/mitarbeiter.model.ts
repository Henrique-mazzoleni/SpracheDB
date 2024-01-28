import { InferSchemaType, Schema, model } from 'mongoose';

const mitarbeiterSchema = new Schema({
  login: { type: String, required: true },
  repos: [{ type: Schema.Types.ObjectId, ref: 'Repo' }],
  sprachen: [
    {
      type: Map,
      of: new Schema({
        id: { type: Schema.Types.ObjectId, ref: 'Sprache' },
        vorkommnisse: Number,
      }),
    },
  ],
});

const Mitarbeiter = model('Mitarbeiter', mitarbeiterSchema);

export default Mitarbeiter;
