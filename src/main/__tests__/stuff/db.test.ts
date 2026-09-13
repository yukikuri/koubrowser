import { describe, expect, it } from 'vitest'
import { DbStuff, LoadResult } from '@main/stuff/db'
import path from 'node:path'
import * as fs from 'node:fs'
import { fileURLToPath } from 'url'
import { DbName } from '@common/record'
const folderPath = path.dirname(fileURLToPath(import.meta.url))

function callLoad(dbStuff: DbStuff, dbName: DbName): Promise<LoadResult[]> {
  return new Promise((resolve) => {
    dbStuff.load(folderPath, [dbName], (results) => {
      console.log('DbStuff.load callback results:', results)
      resolve(results)
    })
  })
}

describe('DbStuff tests', () => {
  //console.log(folderPath) 

  it('load method', async () => {

    {
      const dbStuff = DbStuff.create();
      const results = await callLoad(dbStuff, DbName.quest)
      expect(results[0].err).toBeNull();
    }

    {
      // Make the file read-only for owner/group/others
      const target = path.join(folderPath, 'battle.db');
      await fs.promises.chmod(target, 0o444);

      const dbStuff = DbStuff.create();
      const results = await callLoad(dbStuff, DbName.battle)
      expect(results[0].err).not.toBeNull();
    }
  });

  it('findOne method', async () => {

    {
      const dbStuff = DbStuff.create();
      const results = await callLoad(dbStuff, DbName.quest)
      expect(results[0].err).toBeNull();

      {
        const doc = await dbStuff.queryOne({dbName: DbName.quest, find: { key: 'meta' }});
        console.log(doc)
        expect(doc).not.toBeNull();
      }
      
      {
        const doc = await dbStuff.queryOne({dbName: DbName.quest, find: { key: 'meta0' }});
        expect(doc).toBeNull();
      }

      {
        const doc = await dbStuff.queryOne({dbName: DbName.quest, find: { no: 304 }});
        console.log(doc)
        expect(doc).not.toBeNull();
      }
    }
  });
});
