import * as _ from "lodash";
import * as React from "react";
import {connect} from "react-redux";
import * as URI from "urijs";
const fuzzy = require("fuzzy");
const latinize = require("latinize");
const TreeView = require("react-treeview-lazy");
import {Grid, Row, Col, Glyphicon, Button} from "react-bootstrap";
import {types as atypes} from "../actions";

export function reload_library(config) {
    console.log("Reloading library");
    if(!config.music_host) {
        return Promise.reject("No music host, cannot load library");
    }

    const tracks_url = new URI("tracks.json").absoluteTo(config.music_host);
    return window.fetch(tracks_url.toString()).
    then(response => response.json()).
    then(library => {
        localStorage.setItem("library", JSON.stringify(library));
        return library;
    });
}

function ItemLabelView(
    {label, tracks, on_text_click = null, dispatch}:
    {label: string, tracks: ITrack[], dispatch: any, on_text_click: any}
) {
    return <span>
        <span onClick={on_text_click}>{label}</span>
        <Button
            onClick={() => dispatch({type: atypes.ADD_TO_PLAYLIST, tracks: tracks})}
        >
            <Glyphicon glyph="glyphicon glyphicon-plus" />
        </Button>
    </span>;
}
const ItemLabel = connect(
    null,
    {dispatch: action => action}
)(ItemLabelView) as React.ComponentClass<{
    label: string, tracks: ITrack[], on_text_click?: any
}>;

function LibraryTrack({track, onClick}) {
    const label =
        <ItemLabel
            label={track.title}
            tracks={[track]}
            on_text_click={() => onClick(track)}
        />;
    return <div key={track.title}>
        {label}
    </div>;
}

const LibraryTrackContainer = connect(
    null,
    {
        onClick: (track) => ({type: atypes.PLAY_TRACK, track})
    }
)(LibraryTrack) as React.ComponentClass<{track: ITrack}>;

function LibraryAlbum({album, tracks}) {
    const label = <ItemLabel label={album} tracks={tracks} />;
    return <TreeView key={album} lazy={true} nodeLabel={label} defaultCollapsed={true}>
        {_.map(tracks, (track:ITrack, album_name) =>
            <LibraryTrackContainer key={`${album}.${track.title}`} track={track} />
        )}
    </TreeView>;
}

function LibraryArtist({artist, tracks}) {
    const by_album = _.groupBy<ITrack, string>(tracks, "album");

    const label = <ItemLabel label={artist} tracks={tracks} />;

    return <TreeView key={artist} lazy={true} nodeLabel={label} defaultCollapsed={true}>
        {_.map(by_album, (tracks, album) =>
            <LibraryAlbum key={`${artist}.${album}`} album={album} tracks={tracks} />
        )}
    </TreeView>;
}

const fuzzy_filter = (library, filter) =>
    fuzzy.filter(
        latinize(filter),
        library,
        {extract: track => latinize(`${track.title} - ${track.artist} - ${track.album}`)}
    ).map(result => result.original);

const filter_dispatch = _.debounce((filter_string, dispatch) =>
    dispatch({type: atypes.LIBRARY_FILTER, filter: filter_string}),
    250);

function Library({library, filter, dispatch}) {
    const filtered = fuzzy_filter(library, filter);
    const by_artist: [string, ITrack[]] = (_(filtered).
        groupBy<ITrack, string>("artist").
        toPairs<[string, ITrack[]]>().
        sortBy(([artist, _tracks]: [string, ITrack[]]) => artist.toLowerCase()).
        sortBy(([_artist, tracks]) => tracks.length > 8 ? -1 : 1).
        value() as any);

    return <div>
        <input onChange={
            (e: any) => filter_dispatch(e.target.value, dispatch)
        } />
        {_.map(by_artist, ([artist, tracks]: [string, ITrack[]]) =>
            <LibraryArtist key={artist} artist={artist} tracks={tracks} />
        )}
    </div>;
}
export const LibraryContainer = connect(
    (state) => ({library: state.library, filter: state.library_filter}),
    {
        dispatch: action => action,
    }
)(Library);
