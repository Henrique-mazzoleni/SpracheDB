import { Schema, Types, model } from 'mongoose';

const spracheScheme = new Schema({
  name: { type: String, required: true },
  repos: [{ type: Schema.Types.ObjectId, ref: 'Repo' }],
  mitarbeiter: [
    {
      type: Map,
      of: {
        id: { type: Schema.Types.ObjectId, ref: 'Mitarbeiter' },
        vorkommnisse: Number,
      },
    },
  ],
});

const Sprache = model('Sprache', spracheScheme);

export default Sprache;
