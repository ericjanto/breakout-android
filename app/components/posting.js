import {StyleSheet, Text, View, TouchableNativeFeedback, ToastAndroid} from "react-native";
import ProgressBar from "react-native-progress/Bar";
import * as Colors from "../config/colors";
import React from 'react';
import Image from 'react-native-image-progress';
import {Icon, Thumbnail} from "native-base";
import _ from 'lodash';
import moment from 'moment';
import VideoPlayer from "./video-player";
import {changeFileEnding, transform} from "../screens/all-teams/screen";
import LocalizedStrings from 'react-native-localization';
import NavigationService from "../utils/navigation-service";

export default class Posting extends React.PureComponent {

    constructor(props) {
        super(props);
        this.style = StyleSheet.create({
            container: {
                margin: 10,
                marginBottom: 2,
                elevation: 3,
                backgroundColor: 'white'
            }
        })
    }

    render() {
        const props = this.props;

        return (
            <View style={this.style.container}>
                <CardMedia media={props.media}/>
                <CardHeader {...props} />
                <CardBody text={props.text} challenge={props.challenge}/>
                <CardChallenge challenge={props.proves}/>
                <CardCommentsAndLikes addLike={props.addLike}
                                      hasLiked={props.hasLiked}
                                      comments={props.comments}
                                      likes={props.likes}
                                      postingId={props.id}
                />
            </View>
        );
    }
}

const cardCommentsAndLikesStyle = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        paddingBottom: 10
    },
    innerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
    },
    buttonStyle: {
        padding: 0,
        margin: 0
    },
    likesText: {
        textAlign: 'center',
        marginRight: 30,
        marginTop: -3,
        marginLeft: -5,
        color: 'grey'
    },
    commentsIcon: {
        color: 'grey',
        marginLeft: 10,
        marginRight: 15
    },
    commentsText: {
        textAlign: 'center',
        marginTop: -3,
        marginLeft: -5,
        color: 'grey'
    }
});

export const Button = (props) => {
    return (
        <TouchableNativeFeedback onPress={props.onPress}>
            {props.children}
        </TouchableNativeFeedback>
    )
};

class CardCommentsAndLikes extends React.PureComponent {

    constructor(props) {
        super(props);
        this.onLikePress = this.onLikePress.bind(this, props.postingId)
    }

    onLikePress(postingId) {
        this.props.addLike(postingId);
    }

    onCommentPress() {
        ToastAndroid.show(strings.noCommentsYet, ToastAndroid.SHORT);
    }

    render() {
        const props = this.props;
        const likeColor = (props.hasLiked) ? Colors.LikeRed : 'grey';

        return (
            <View style={cardCommentsAndLikesStyle.container}>
                <Button onPress={this.onLikePress}>
                    <View style={cardCommentsAndLikesStyle.innerContainer}>
                        <Icon active={props.hasLiked} name='heart'
                              style={{color: likeColor, marginLeft: 15, marginRight: 15}}/>
                        <Text style={cardCommentsAndLikesStyle.likesText}>{props.likes} {strings.likes}</Text>
                    </View>
                </Button>


                <Button onPress={this.onCommentPress}>
                    <View style={cardCommentsAndLikesStyle.innerContainer}>
                        <Icon name='text' style={cardCommentsAndLikesStyle.commentsIcon}/>
                        <Text style={cardCommentsAndLikesStyle.commentsText}>
                            {_.get(props, 'comments.length', 0)} {strings.comments}
                        </Text>
                    </View>
                </Button>
            </View>
        );
    }
}

const CardChallenge = (props) => {
    if (!props.challenge) {
        return (null)
    }

    return (
        <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            margin: 15,
            padding: 10,
            marginTop: 5,
            borderWidth: 1,
            borderRadius: 4,
            borderColor: Colors.Grey
        }}>
            <View style={{width: 55}}>
                <View style={{flex: 1, flexDirection: 'column', alignContent: 'center'}}>
                    <Icon style={{color: 'green'}} name='done-all'/>
                    <Text style={{color: 'green'}}>{props.challenge.amount} €</Text>
                </View>
            </View>
            <View style={{flex: 1}}>
                <Text>{props.challenge.description}</Text>
            </View>
        </View>
    );
};

const headerStyle = StyleSheet.create({
    container: {
        paddingLeft: 15,
        paddingTop: 17,
        paddingBottom: 4,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start'
    },
    profilePic: {
        paddingRight: 10
    },
    title: {
        fontWeight: 'bold'
    },
    subtitle: {
        fontSize: 13,
        paddingTop: 2,
        color: Colors.Subtitle
    }
});

const CardHeader = (props) => {

    const teamName = _.get(props, 'user.participant.teamName', 'no name');
    const teamId = _.get(props, 'user.participant.teamId', 0);

    // TODO make button not clickable from team profile
    return (
        <Button onPress={() => NavigationService.navigate('aTeam', {teamId: teamId, teamName: teamName})}>
            <View style={headerStyle.container}>
                <View style={headerStyle.profilePic}>
                    <ProfilePic url={_.get(props, 'user.profilePic.url')}/>
                </View>
                <View>
                    <Text
                        style={headerStyle.title}>{`${teamName} #${teamId}`}</Text>
                    <Text style={headerStyle.subtitle}>{generateSubtitle(props)}</Text>
                </View>
            </View>
        </Button>
    );
};

const cardBodyStyle = StyleSheet.create({
    container: {
        paddingLeft: 15,
        paddingRight: 15,
        paddingTop: 10,
        paddingBottom: 10
    }
});

const CardBody = (props) => {

    if (!props.text) {
        return (null);
    }

    return (
        <View style={cardBodyStyle.container}>
            <Text>{props.text}</Text>
        </View>
    )
};

const CardMedia = (props) => {

    const url = _.get(props, 'media.url');
    const type = _.get(props, 'media.type');

    if (url) {
        switch (type.toLowerCase()) {
            case 'image':
                return (
                    <Image
                        source={{uri: transform('h_400,f_auto,q_auto:eco', url)}}
                        style={{height: 200, width: null, flex: 1, backgroundColor: Colors.Secondary}}
                        indicator={ProgressBar}
                        cache='force-cache'
                    />
                );
            case 'video':
                const newUrl = changeFileEnding(transform('h_400,q_auto:eco', url), 'mp4');
                return <VideoPlayer url={newUrl}
                                    paused={true}/>;
            default:
                console.error(`Unsupported media type ${type} from url ${url}`);
                return (null);
        }
    } else {
        return (null);
    }
};

function generateSubtitle(props) {
    return `${generateTimeString(props.date)} ${generateLocationString(props.postingLocation)}`;
}

function generateTimeString(timestamp) {
    if (!timestamp) {
        console.warn("No timestamp where we expected to have one");
        return "";
    }

    // TODO: Set moment locale
    return moment.unix(timestamp).fromNow();
}

function generateLocationString(location) {
    if (!location) {
        return "";
    } else {

        // see https://developers.google.com/maps/documentation/geocoding/intro?hl=de
        // for more details on what those mean
        const locality = _.get(location, 'locationData.LOCALITY');
        const country = _.get(location, 'locationData.COUNTRY');

        const adminLevel1 = _.get(location, 'locationData.ADMINISTRATIVE_AREA_LEVEL_1');
        const adminLevel2 = _.get(location, 'locationData.ADMINISTRATIVE_AREA_LEVEL_2');
        const adminLevel3 = _.get(location, 'locationData.ADMINISTRATIVE_AREA_LEVEL_3');
        const adminLevel4 = _.get(location, 'locationData.ADMINISTRATIVE_AREA_LEVEL_4');

        const lowestLevel = _.head([adminLevel4, adminLevel3, adminLevel2, adminLevel1]);

        if (locality && country) {
            return `in ${locality}, ${country}`
        } else if (lowestLevel && country) {
            return `in ${lowestLevel}, ${country}`
        } else if (country) {
            return `in ${country}`
        } else if (location.latitude && location.longitude) {
            return `(${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)})`
        }
    }
}

export const ProfilePic = (props) => {

    if (props.size === "big") {
        if (props.url) {
            return <Thumbnail big source={{uri: props.url}}/>
        } else {
            return <Thumbnail big source={require('../assets/profile_pic_placeholder.jpg')}/>
        }
    } else {
        if (props.url) {
            return <Thumbnail small source={{uri: props.url}}/>
        } else {
            return <Thumbnail small source={require('../assets/profile_pic_placeholder.jpg')}/>
        }
    }
};

let strings = new LocalizedStrings({
    "en-US": {
        comments: 'Comments',
        likes: 'Likes',
        noCommentsYet: 'Comments not working on Android yet'
    },
    de: {
        comments: 'Kommentare',
        likes: 'Likes',
        noCommentsYet: 'Kommentare funktionieren auf Android noch nicht'

    }
});
