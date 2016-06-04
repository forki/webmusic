import * as _ from "lodash";
import * as React from "react";
import {connect} from "react-redux";
const fuzzy = require("fuzzy");
const latinize = require("latinize");
const TreeView = require("react-treeview");

function ItemLabelView(
    {label, tracks, on_text_click = null, dispatch}:
    {label: string, tracks: ITrack[], dispatch: any, on_text_click: any}
) {
    return <span>
        <span onClick={on_text_click}>{label}</span>
        <span
            style={{backgroundColor: "black", color: "white", marginLeft: "1em"}}
            onClick={() => dispatch({type: "add_to_playlist", tracks: tracks})}
        >
            +
        </span>
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
        />
    return <div key={track.title}>
        {label}
    </div>;
}

const LibraryTrackContainer = connect(
    null,
    {
        onClick: (track) => ({type: "play_track", track})
    }
)(LibraryTrack) as React.ComponentClass<{track: ITrack}>;

function LibraryAlbum({album, tracks}) {
    const label = <ItemLabel label={album} tracks={tracks} />
    return <TreeView key={album} nodeLabel={label} defaultCollapsed={true}>
        {_.map(tracks, (track:ITrack, album_name) =>
            <LibraryTrackContainer key={`${album}.${track.title}`} track={track} />
        )}
    </TreeView>
}

function LibraryArtist({artist, tracks}) {
    const by_album = _.groupBy<ITrack, string>(tracks, "album");
    const label = <ItemLabel label={artist} tracks={tracks} />

    return <TreeView key={artist} nodeLabel={label} defaultCollapsed={true}>
        {_.map(by_album, (tracks, album) =>
            <LibraryAlbum key={`${artist}.${album}`} album={album} tracks={tracks} />
        )}
    </TreeView>
}

const fuzzy_filter = _.throttle((library, filter) =>
    fuzzy.filter(
        latinize(filter),
        library,
        {extract: track => latinize(`${track.title} - ${track.artist} - ${track.album}`)}
    ).map(result => result.original), 0);

function Library({library, filter, dispatch}) {
    const filtered = fuzzy_filter(library, filter);
    const by_artist = _.groupBy<ITrack, string>(filtered, "artist");

    return <div>
        <input onChange={
            (e : any) => dispatch({type: "library_filter", filter: e.target.value})
        } />
        {_.map(by_artist, (tracks, artist) =>
            <LibraryArtist key={artist} artist={artist} tracks={tracks} />
        )}
    </div>;
}
export const LibraryContainer = connect(
    (state) => ({library: state.library, filter: state.library_filter}),
    {
        dispatch: action => action,
    }
)(Library)