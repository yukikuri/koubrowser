import { expect, describe, it } from 'vitest'
import * as kcsapi from '@common/kcsapi'

describe('kcsapi get server id test', () => {
  it('get server id(ok)', () => {
    const urls: {url: string, id: kcsapi.ApiServerId}[] = [
      { url: 'https://w01y.kancolle-server.com/kcs2/index.php', id: kcsapi.ApiServerId.world1 },
      { url: 'https://w02k.kancolle-server.com/kcs2/index.php', id: kcsapi.ApiServerId.world2 },
      { url: 'https://w03s.kancolle-server.com/kcs2/index.php', id: kcsapi.ApiServerId.world3 },
      { url: 'https://w04m.kancolle-server.com/kcs2/index.php', id: kcsapi.ApiServerId.world4 },
      { url: 'https://w05o.kancolle-server.com/kcs2/index.php', id: kcsapi.ApiServerId.world5 },
      { url: 'https://w06t.kancolle-server.com/kcs2/index.php', id: kcsapi.ApiServerId.world6 },
      { url: 'https://w07l.kancolle-server.com/kcs2/index.php', id: kcsapi.ApiServerId.world7 },
      { url: 'https://w08r.kancolle-server.com/kcs2/index.php', id: kcsapi.ApiServerId.world8 },
      { url: 'https://w09s.kancolle-server.com/kcs2/index.php', id: kcsapi.ApiServerId.world9 },
      { url: 'https://w10b.kancolle-server.com/kcs2/index.php', id: kcsapi.ApiServerId.world10 },
      { url: 'https://w11t.kancolle-server.com/kcs2/index.php', id: kcsapi.ApiServerId.world11 },
      { url: 'https://w12p.kancolle-server.com/kcs2/index.php', id: kcsapi.ApiServerId.world12 },
      { url: 'https://w13b.kancolle-server.com/kcs2/index.php', id: kcsapi.ApiServerId.world13 },
      { url: 'https://w14h.kancolle-server.com/kcs2/index.php', id: kcsapi.ApiServerId.world14 },
      { url: 'https://w15p.kancolle-server.com/kcs2/index.php', id: kcsapi.ApiServerId.world15 },
      { url: 'https://w16s.kancolle-server.com/kcs2/index.php', id: kcsapi.ApiServerId.world16 },
      { url: 'https://w17k.kancolle-server.com/kcs2/index.php', id: kcsapi.ApiServerId.world17 },
      { url: 'https://w18i.kancolle-server.com/kcs2/index.php', id: kcsapi.ApiServerId.world18 },
      { url: 'https://w19s.kancolle-server.com/kcs2/index.php', id: kcsapi.ApiServerId.world19 },
      { url: 'https://w20h.kancolle-server.com/kcs2/index.php', id: kcsapi.ApiServerId.world20 },
    ];
    urls.forEach(({url, id}) => {
      expect(kcsapi.getServerId(url)).toBe(id);
    });
  });

  it('get server id(ng)', () => {
    const urls: string[] = [
      '',
      'https://example.com/kcs2/index.php',
      'https://w21x.kancolle-server.com/kcs2/index.php',
      'https://w0.kancolle-server.com/kcs2/index.php',
      'https://w20.kancolle-server.com/kcs2/index.php',
    ];
    urls.forEach((url) => {
      expect(kcsapi.getServerId(url)).toBe(undefined);
    });
  })
})
