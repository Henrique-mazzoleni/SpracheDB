import { Schema, Types, model } from 'mongoose';

const repoSchema = new Schema({
  name: { type: String, required: true },
  mitarbeiter: [{ type: Schema.Types.ObjectId, ref: 'Mitarbeiter' }],
  sprachen: [{ type: Schema.Types.ObjectId, ref: 'Sprache' }],
});

const Repo = model('Repo', repoSchema);

export default Repo;
