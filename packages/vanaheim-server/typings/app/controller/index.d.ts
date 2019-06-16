// This file is created by egg-ts-helper@1.25.3
// Do not modify this file!!!!!!!!!

import 'egg';
import ExportBookshelf from '../../../app/controller/Bookshelf';
import ExportComic from '../../../app/controller/Comic';
import ExportComicGlass from '../../../app/controller/ComicGlass';
import ExportCrawler from '../../../app/controller/Crawler';
import ExportWorkspace from '../../../app/controller/Workspace';

declare module 'egg' {
  interface IController {
    bookshelf: ExportBookshelf;
    comic: ExportComic;
    comicGlass: ExportComicGlass;
    crawler: ExportCrawler;
    workspace: ExportWorkspace;
  }
}
