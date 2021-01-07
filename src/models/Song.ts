import MySQL from "../db/MySQL";
import DateException from "../exception/DateException";
import Type from "./Type";

export default class Song{

    protected idSong ?: number | null;
    public name: string;
    public cover: string;
    public time: string;
    public createdAt: string;
    public updatedAt: string;
    public type_idType: number;

    protected table: string = 'song';

    constructor(song: Song | null, name: string = '', cover: string = '', time: string = '', createdAt: string = '', updatedAt: string = '', type_idType: number = 1){
        if (song === null){
            this.name = name;
            this.cover = cover;
            this.time = time;
            this.createdAt = createdAt;
            this.updatedAt = updatedAt;
            this.type_idType = type_idType;
        } else {
            this.idSong = song.id;
            this.name = song.name;
            this.cover = song.cover;
            this.time = song.time;
            this.createdAt = song.createdAt;
            this.updatedAt = song.updatedAt;
            this.type_idType = song.type_idType;
        }
    }

    get id(): number{
        return <number>this.idSong;
    }

    get nom(): string{
        return <string>this.name;
    }

    get couverture(): string{
        return <string>this.cover;
    }

    get duration(): string{
        return <string>this.time;
    }

    get creationDate(): string{
        return <string>this.createdAt;
    }

    get updatedDate(): string{
        return <string>this.updatedAt;
    }

    get type(): string{
        return new Type(<number>this.type_idType).nom;
    }

    // Convert duration time from seconds to mm:ss
    static duration(time: number){
        const minutes = Math.floor(time / 60);
        const seconds = time - minutes * 60;

        const mm = (minutes.toString().length == 1) ? '0' + minutes : minutes;
        const ss = (seconds.toString().length == 1) ? '0' + seconds : seconds;
        const duration = mm + ":" + ss;

        return duration;
    }

    static select(where: any) {
        return new Promise((resolve, reject) => {
            MySQL.select('song', where).then((arraySong: Array<any>) => {
                let data: Array<Song> = [];
                for (const song of arraySong) {
                    song.createdAt = DateException.formatDate(song.createdAt);
                    song.updatedAt = DateException.formatDate(song.updatedAt);
                    song.id = song.idSong;
                    song.type_idType = song.idType;
                    song.time = this.duration(song.time);
                    data.push(new Song(song));
                }

                console.log(data);
                resolve(data);
            })
            .catch((err: any) => {
                console.log(err);
                reject(false);
            });
        })
    }

    static selectAll() {
        return new Promise((resolve, reject) => {
            MySQL.selectAll('song').then((arraySong: Array<any>) => {
                let data: Array<Song> = [];
                for (const song of arraySong) {
                    song.createdAt = DateException.formatDate(song.createdAt);
                    song.updatedAt = DateException.formatDate(song.updatedAt);
                    song.id = song.idSong;
                    song.type_idType = song.idType;
                    song.time = this.duration(song.time);
                    data.push(new Song(song));
                }

                console.log(data);
                resolve(data);
            })
            .catch((err: any) => {
                console.log(err);
                reject(false);
            });
        })
    }
}