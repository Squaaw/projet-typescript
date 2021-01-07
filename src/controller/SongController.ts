import { Request, Response } from 'express';
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

                const song: any = {
                    id: songs[i].idSong,
                    name: songs[i].name,
                    url: url,
                    cover: songs[i].cover,
                    time: songs[i].time,
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

    static getSongById = async(req: Request, res: Response) => {

        const songId: any = req.params.id

        try{
            const song: any = await Song.select({ idSong: songId});
            const url = "http://localhost:8081/songs/" + songId;
            const type: any = await Type.select({ idType: song[0].type_idType });

            return res.status(201).json({
                error: false,
                song: {
                    id: song[0].idSong,
                    name: song[0].name,
                    url: url,
                    cover: song[0].cover,
                    time: song[0].time,
                    createdAt: song[0].createdAt,
                    updateAd: song[0].updatedAt,
                    type: type[0].name
                }
            });

        } catch (err) {
            console.log(err);
        }
    }
}