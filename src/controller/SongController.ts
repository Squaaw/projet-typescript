import { Request, Response } from 'express';
import { verify } from "jsonwebtoken";
import TokenException from "../exception/TokenException";
import Song from '../models/Song';
import Type from '../models/Type';

export class SongController { 
    
    static getSongs = async(req: Request, res: Response) => {

        try{
            const songs: any = await Song.selectAll();

            let i: number;
            let songData: Array<any> = [];

            for (i = 0; i < songs.length; i++){
                const type: any = await Type.select({ idType: songs[i].type_idType});
                const url = "http://localhost:8081/songs/" + songs[i].idSong;

                // Convert duration time from seconds to mm:ss
                const time = songs[i].time;
                const minutes = Math.floor(time / 60);
                const seconds = time - minutes * 60;

                const mm = (minutes.toString().length == 1) ? '0' + minutes : minutes;
                const ss = (seconds.toString().length == 1) ? '0' + seconds : seconds;
                const duration = mm + ":" + ss;

                const song: any = {
                    id: songs[i].idSong,
                    name: songs[i].name,
                    url: url,
                    cover: songs[i].cover,
                    time: duration,
                    createdAt: songs[i].createdAt,
                    updateAt: songs[i].updatedAt,
                    type: type[0].name
                }
                songData.push(song);
            }

            return res.status(200).json({
                error: false,
                songs: songData
            });

        } catch (err) {
            console.log(err);
        }

    }
}