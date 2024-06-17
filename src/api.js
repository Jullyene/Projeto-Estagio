import { readFile } from 'fs';
import path from 'path';

export function getMeasurements() {
     const filepath = path.join(process.cwd(), '..', 'data','measurements.txt');
     
     return new Promise((resolve, reject) => {
          readFile(filepath, 'utf8', (err, data) => {
               if (err) {
                    reject(err);
                    return;
               }
               resolve(data);
          });
     })
}