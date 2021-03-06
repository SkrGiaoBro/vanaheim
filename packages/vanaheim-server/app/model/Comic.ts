import { Application } from 'egg';
import { Document, Schema } from 'mongoose';
import { Comic } from 'vanaheim-shared';

export default (app: Application) => {
  const mongoose = app.mongoose;
  const comicSchema = new mongoose.Schema({
    title: { type: Schema.Types.String },
    titleOriginal: { type: Schema.Types.String },
    cover: { type: Schema.Types.Buffer },
    rate: { type: Schema.Types.Number },
    reclass: { type: Schema.Types.String },
    workspaceId: { type: Schema.Types.String },
    language: { type: [Schema.Types.String] },
    character: { type: [Schema.Types.String] },
    group: { type: Schema.Types.String },
    parody: { type: [Schema.Types.String] },
    tags: { type: [Schema.Types.String] },
    read: { type: Schema.Types.Boolean },
    artist: { type: [Schema.Types.String] },
    fileSize: { type: Schema.Types.Number },
    createdAt: { type: Schema.Types.Date, index: true },
    modifiedAt: { type: Schema.Types.Date },
  });
  return mongoose.model<Document & Comic>('Comic', comicSchema);
};
