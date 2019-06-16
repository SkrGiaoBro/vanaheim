import { Controller } from 'egg';

export default class ComicGlassController extends Controller {
  async list() {
    const { ctx } = this;
    const list = await this.service.bookshelf.list();

    const bookshelfList = list.map(({ title, id }) => {
      return `<a href="/comicGlass/${id}" booktitle="${title}">${title}</a>`;
    });
    ctx.set('Content-Type', 'text/html; charset=UTF-8');
    ctx.body = `<html><body>${bookshelfList.join('<br>')}</body></html>`;
  }

  async getById() {
    const { ctx } = this;
    const bookShelfId = ctx.params.id;
    const detail = await this.service.bookshelf.getDetail(bookShelfId);
    const comicList = detail.comicList.map(({ title, id }) => {
      return `<a href="/static/comic/${id}/${encodeURI(
        title
      )}.zip" booktitle="${title}">${title}</a>`;
    });
    ctx.set('Content-Type', 'text/html; charset=UTF-8');
    ctx.body = `<html><body>${comicList.join('<br>')}</body></html>`;
  }
}
