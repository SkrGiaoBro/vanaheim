import { AddComicFormInfo } from 'vanaheim-shared/src/model/comic';
import { Service } from 'egg';

export default class ComicService extends Service {
  async add(comic: Partial<AddComicFormInfo>, cover: string) {
    const { title, titleOriginal, parody, tags } = comic;
    return this.ctx.model.Comic.create({
      title,
      titleOriginal,
      read: false,
      cover,
      parody,
      tags,
      createdAt: Date.now(),
      modifiedAt: Date.now(),
    });
  }
}