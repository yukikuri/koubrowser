import type { Query, DbName, Insert, Update, Remove, UpdateRes, Operation } from '@common/record'
import NeDB from 'nedb'
import path from 'node:path'

/**
 * 
 */
export interface LoadResult {
  name: DbName
  err: Error | null | undefined

}

/**
 * 
 */
export class DbStuff {
  private dbs: Map<DbName, NeDB> = new Map()
  private loading: Map<DbName, Error | null | undefined> = new Map()
  private uniqueCounter = 0

  /**
   * 
   * @param userDir 
   * @param dbs 
   * @returns 
   */
  static create(): DbStuff {
    return new DbStuff()
  }

  /**
   * 
   * @param userDir 
   * @param dbs 
   */
  load(userDir: string, dbs: DbName[], cb: (results: {name: DbName, err: any}[]) => void) {
    const openDb = (name: DbName): NeDB => {
      const db = new NeDB({filename: path.join(userDir, name+'.db')})
      db.loadDatabase((err: Error | null) => {
        this.loading[name] = err
        if (err) {
          console.error(`[worker] failed to load ${name}:`, err)
        } else {
          console.log(`[worker] loaded DB: ${name}`)
        }
        this.loading.set(name, err);
        const loadedCount = this.loading.values().reduce((c, v) => v !== undefined ? c + 1 : c, 0)
        console.log('worker db loadDatabase callback:', loadedCount, dbs.length, err)
        if (dbs.length === loadedCount) {
          const results: LoadResult[] = dbs.map((n) => ({ name: n, err: this.loading.get(n) }) )
          cb(results)
        }
      })
      return db
    }

    dbs.forEach((name) => {
      if (! this.dbs[name]) {
        this.loading.set(name, undefined)
        this.dbs.set(name, openDb(name));
      }
    });
  }

  /**
   * 
   * @param dbName 
   * @param doc 
   * @returns 
   */
  insert(doc: Insert): Promise<any> {
    const db = this.dbs.get(doc.dbName)
    return new Promise((resolve, reject) => {
      if (! db) {
        return reject(new Error('DB not found: ' + doc.dbName))
      }
      db.insert(doc.record, (err: Error | null, newDoc: any) => {
        if (err) {
          return reject(err)
        } else {
          resolve(newDoc)
        }
      })
    })
  }
  
  /**
   * 
   * @param query
   * @returns 
   */
  query(query: Query): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const db = this.dbs.get(query.dbName)
      if (! db) {
        return reject(new Error('DB not found: ' + query.dbName))
      }

      const find = db.find(query.find ?? {}, query.projection as any)
      if (query.limit) {
        find.limit(query.limit)
      }
      if (query.sort) {
        find.sort(query.sort)
      }
      const counter = this.uniqueCounter++
      console.time('handle query ' + query.dbName + ' #' + counter)
      find.exec((err, docs: any[]): void => {
        console.timeEnd('handle query ' + query.dbName + ' #' + counter)
        console.log('found docs:', query.dbName, 'count:', docs.length)
        if (err) {
          reject(err)
        } else {
          resolve(docs)
        }
      })
    })
  }

  /**
   * 
   * @param query
   * @returns 
   */
  queryOne(query: Query): Promise<any> {
    const db = this.dbs.get(query.dbName)
    return new Promise((resolve, reject) => {
      if (! db) {
        return reject(new Error('DB not found: ' + query.dbName))
      }
      const counter = this.uniqueCounter++
      console.time('handle query one ' + query.dbName + ' #' + counter)
      //db.findOne(query.find_param ?? {}, query.projection as any, (err, doc: any): void => {
      db.findOne(query.find ?? {}, (err, doc: any): void => {
        console.timeEnd('handle query one ' + query.dbName + ' #' + counter)
        console.log('found docs:', query.dbName, 'ok:', !!doc)
        if (err) {
          reject(err)
        } else {
          resolve(doc)
        }
      })
    })
  }

  /**
   * 
   * @param update 
   * @returns 
   */
  update(update: Update): Promise<UpdateRes> {
    const db = this.dbs.get(update.dbName)
    return new Promise((resolve, reject) => {
      if (! db) {
        return reject(new Error('DB not found: ' + update.dbName))
      }

      db.update(update.query, update.updateQuery, update.options, (err, num, affectedDocs, upsert) => {
          if (err) {
            reject(err)
          } else {
            resolve({ num, affectedDocs, upsert })
          }
        }
      )
    })
  }

  /**
   * 
   * @param remove 
   * @returns 
   */
  remove(remove: Remove): Promise<number> {
    const db = this.dbs.get(remove.dbName)
    return new Promise((resolve, reject) => {
      if (! db) {
        return reject(new Error('DB not found: ' + remove.dbName))
      }

      db.remove(remove.remove_param, (err, numRemoved) => {
        if (err) {
          reject(err)
        } else {
          resolve(numRemoved)
        }
      })
    })
  }

  /**
   * 
   * @param operation 
   * @returns 
   */
  operation(operation: Operation): boolean {
    const db = this.dbs.get(operation.dbName)
    if (! db) {
      return false
    }

    if (operation.autocompactionInterval !== undefined) {
      if (operation.autocompactionInterval < 0) {
        db.persistence.stopAutocompaction()
      } else {
        db.persistence.setAutocompactionInterval(operation.autocompactionInterval)
      }
    }
    return true
  }
}

export function createDbStuff(): DbStuff {
  return DbStuff.create()
}
