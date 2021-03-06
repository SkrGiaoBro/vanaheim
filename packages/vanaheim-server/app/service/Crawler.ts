import { ComicSite, ComicRawInfo } from 'vanaheim-shared';
import { tryFunction } from 'vanaheim-shared/lib/utils';
import { Service } from 'egg';
import { request } from 'urllib';
import * as Cheerio from 'cheerio';
export default class CrawlerService extends Service {
  eHentaiRequest = {
    timeout: 5000,
    headers: {
      'accept-language': 'zh-CN,zh;q=0.9,en;q=0.8,ja;q=0.7,zh-TW;q=0.6',
      'User-Agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.169 Safari/537.36',
      accept:
        'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3',
    },
  };

  async search(type: ComicSite, keyword: string) {
    if (type === ComicSite.EHentai) {
      return this.getFromEHentai(keyword);
    }
    if (type === ComicSite.NHentai) {
      return this.getFromNHentai(keyword);
    }
  }

  private async getFromNHentai(query: string) {
    const host = 'https://nhentai.net';
    const response = await request(`${host}/search/?q=${query}`, this.eHentaiRequest);
    const $ = Cheerio.load(response.data, {
      decodeEntities: false,
    });
    const rawInfo: Partial<ComicRawInfo>[] = [];
    const linkList = tryFunction(() => {
      return Array.from($('.cover')).map(o => `${host}${o.attribs.href}`);
    }, []);
    if (linkList) {
      for (const url of linkList.slice(0, 2)) {
        const response = await this.getFromHentaiDetail(url);
        if (response) {
          rawInfo.push(response);
        }
      }
    }
    return rawInfo;
  }

  private async getFromHentaiDetail(url): Promise<Partial<ComicRawInfo>> {
    const response = await request(`${url}`, this.eHentaiRequest);
    const $ = Cheerio.load(response.data, {
      decodeEntities: false,
    });

    const titleOriginal = tryFunction(() => {
      return $('#info > h2').text();
    });
    const title = tryFunction(() => {
      return $('#info > h1').text();
    });

    const tagsInfo =
      tryFunction<{ [tag: string]: string[] }>(() => {
        const result: { [tag: string]: string[] } = {};
        const getTag = (element: CheerioElement) => {
          let tagName = tryFunction(() => {
            return /(.*):/.exec(Cheerio(element).text())![1];
          }, '');
          let list = tryFunction(() => {
            return Array.from(Cheerio(element).find('a')).map(o =>
              Cheerio(o)
                .removeClass('count')
                .text()
                .replace(/\(.*\)/, '')
                .trim()
            );
          }, []);
          return { tagName, list };
        };
        Array.from($('#tags > div'))
          .map(getTag)
          .forEach(({ tagName, list }) => {
            if (tagName && list) {
              result[tagName.trim()] = list;
            }
          });
        return result;
      }) || {};

    const {
      Parodies: parody,
      Characters: character,
      Tags: tags,
      Artists: artist,
      Groups: group,
      Languages: language,
      Categories: reclass,
    } = tagsInfo;
    const cover = tryFunction<string>(() => {
      return $('#cover > a > img').attr()['data-src'];
    });
    const res: Partial<ComicRawInfo> = {
      titleOriginal,
      title,
      tags,
      language,
      parody,
      artist,
      character,
      cover,
    };
    if (group && group.length > 0) {
      res.group = group[0];
    }
    if (reclass && reclass.length > 0) {
      res.reclass = reclass[0];
    }
    return res;
  }

  private async getFromEHentai(query) {
    const response = await request(`https://e-hentai.org/?f_search=${query}`, this.eHentaiRequest);
    const $ = Cheerio.load(response.data, {
      decodeEntities: false,
    });
    const rawInfo: Partial<ComicRawInfo>[] = [];
    const linkList = tryFunction(() => {
      return Array.from($('td.gl3c.glname > a')).map(o => o.attribs.href);
    }, []);

    if (linkList) {
      for (const url of linkList.slice(0, 2)) {
        const response = await this.getEHentaiDetail(url);
        if (response) {
          rawInfo.push(response);
        }
      }
    }
    return rawInfo;
  }

  private async getEHentaiDetail(url): Promise<Partial<ComicRawInfo>> {
    const response = await request(`${url}`, this.eHentaiRequest);
    const $ = Cheerio.load(response.data, {
      decodeEntities: false,
    });
    const titleOriginal = tryFunction(() => {
      return $('#gj').text();
    });
    const title = tryFunction(() => {
      return $('#gn').text();
    });
    const tags =
      tryFunction<{ [tag: string]: string[] }>(() => {
        const result: { [tag: string]: string[] } = {};
        const getTag = (element: CheerioElement) => {
          let tagName = tryFunction(() => {
            return Cheerio(element.firstChild)
              .text()
              .replace(':', '');
          }, '');
          let list = tryFunction(() => {
            return Array.from(Cheerio(element).find('div')).map(o => Cheerio(o).text());
          }, []);
          return { tagName, list };
        };
        Array.from($('#taglist').find('tr'))
          .map(getTag)
          .forEach(({ tagName, list }) => {
            if (tagName && list) {
              result[tagName] = list;
            }
          });
        return result;
      }) || {};

    const rate = tryFunction(() => {
      return $('#rating_label')
        .text()
        .replace('Average: ', '');
    });

    const cover = tryFunction<string>(() => {
      return /(http.*\.(jpg|jpeg|png|tiff))/.exec($('#gd1 > div').attr().style)![0];
    });

    const reclass = tryFunction<string>(() => {
      return /e-hentai.org\/(.*)'/.exec($('#gdc > div').attr().onclick)![1];
    });

    const res: Partial<ComicRawInfo> = {
      reclass,
      titleOriginal,
      title,
      cover,
      rate: parseFloat(rate!),
    };

    let allTag: string[] = [];
    let { group } = tags;

    if (group && group.length > 0) {
      res.group = group[0];
    }

    ['character', 'parody', 'artist', 'language'].forEach(key => {
      const temp = tags[key];
      if (temp && Array.isArray(temp) && temp.length > 0) {
        res[key] = temp;
      }
    });

    ['female', 'male', 'misc'].forEach(key => {
      const temp = tags[key];
      if (temp && Array.isArray(temp) && temp.length > 0) {
        allTag = allTag.concat(temp);
      }
    });

    res.tags = allTag;

    return res;
  }
}
