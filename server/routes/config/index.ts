import { Router, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import SMCloudStore from 'smcloudstore';
import env from '../../env';

const storageProvider = env('STORAGE_PROVIDER') || 'local'
const storagePath= env('STORAGE_PATH');
const storageContainer= env('STORAGE_CONTAINER');
const storageConnection = (env('STORAGE_CONNECTION') && JSON.parse(env('STORAGE_CONNECTION')))

let  storage = null;
if(storageProvider !== 'local' && !(storageProvider!==undefined && storagePath!==undefined && storageContainer!==undefined && storageConnection!==undefined)){
    throw Error("Valid args not found for storage provider")
}else{
    storage = SMCloudStore.Create(storageProvider, storageConnection)
}


let localConfigData = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), 'public/config.json')).toString())

const configServer = Router();

// TODO: config.js support
configServer
    .get('/config.json', async(req: Request, res: Response) => {
        let configString = ''
        if(storageProvider!== 'local'){
            configString = await storage.getObjectAsString(storageContainer, storagePath);
            return res.status(200).json(JSON.parse(configString));
        }
        return res.status(200).json(localConfigData)
    });

configServer
    .get('/config.js', async(req: Request, res: Response) => {
        let configString = ''
        if(storageProvider!== 'local'){
            configString = await storage.getObjectAsBuffer(storageContainer, storagePath);
            res.writeHead(200, { 'Content-Type': 'text/javascript' });
            return res.end(configString, 'utf-8');
        }
        
        return res.status(500)
    });


export default configServer;



