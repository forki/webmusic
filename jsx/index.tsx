import * as _ from "lodash";
import * as React from "react";
import {PropTypes} from "react";
import {Provider, connect} from "react-redux";
import { Router, Route, IndexRoute, Link, browserHistory } from "react-router";
import * as URI from "urijs";

import {LibraryContainer} from "./library";
import {Playlist} from "./playlist";
import {Config} from "./config";

function Player(
    {track, track_ended, music_host, dispatch}:
    {track: ITrack, track_ended: any, music_host: string, dispatch: any}
) {
    const audio_source = track ? new URI(track.path).absoluteTo(music_host).toString() : null
    let header = undefined;
    if(track) {
        header = <p>{track.title} / {track.artist} - {track.album}</p>;
    } else {
        header = ""
    }

    function trans_url(type) {
        const url = encodeURIComponent(audio_source);
        return `/transcode?output_format=${type}&url=${url}`;
    }
    let sources = null;
    if(audio_source) {
        sources = [
            <source src={audio_source} onError={e => console.error(e.nativeEvent)}/>,
            <source src={trans_url("ogg")} type="audio/ogg" />,
            <source src={trans_url("mp3")} type="audio/mpeg" />,
            <source src={trans_url("mp4")} type="audio/mp4" />,
            <source src={trans_url("wav")} type="audio/wav" />,
        ];
    }

    const audio_key = track ? `${track.artist} - ${track.album} - ${track.title}` : null;
    return (
        <div>
            {header}
            <audio
                key={audio_key}
                controls="controls"
                style={{width: "100%"}}
                autoPlay="true"
                onEnded={track_ended}
                onError={e => console.error(e.nativeEvent)}
            >
                {sources}
            </audio>
            <button onClick={() => dispatch({type: "prev_track"})}>Prev</button>
            <button onClick={() => dispatch({type: "next_track"})}>Next</button>
        </div>
    );
}
const PlayerContainer = connect(
    (state) => ({
        track: state.playlist.current_track,
        music_host: state.config.music_host
    }),
    {
        dispatch: action => action,
        track_ended: () => ({type: "track_ended"})
    }
)(Player);

function AppView({error_msg, children}) {
    return <div>
        <Link to="/">Home</Link>
        <Link to="/config">Configuratorizor</Link>
        <p>{error_msg}</p>

        <div className="row">
            <PlayerContainer />
        </div>

        {children}
    </div>;
}

const App = connect(state => ({error_msg: state.error_msg}))(AppView);

function Jukebox() {
    return <div className="row">
        <div className="small-12 medium-4 columns">
            <LibraryContainer key="library" />
        </div>
        <div className="small-12 medium-8 columns">
            <Playlist key="playlist" />
        </div>
    </div>
}

export function mkdom(store) {
    return <Provider store = {store}>
        <Router history={browserHistory}>
            <Route path="/" component={App}>
                <IndexRoute component={Jukebox} />
                <Route path="config" component={Config}></Route>
            </Route>
        </Router>
    </Provider>
}
