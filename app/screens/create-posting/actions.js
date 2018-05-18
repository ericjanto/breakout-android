import BreakoutApi from "breakout-api-client";
import {BASE_URL, CLIENT_NAME, CLIENT_SECRET, CLOUDINARY_API_KEY, DEBUG} from "../../config/secrets";

import RNFetchBlob from 'react-native-fetch-blob';
import {withAccessToken} from "../../utils/utils";

// TODO: Move api key to conf
const api = new BreakoutApi(BASE_URL, CLIENT_NAME, CLIENT_SECRET, "breakout", "955374861429162", DEBUG);

export const ON_FETCH_CHALLENGES_FOR_TEAM_SUCCESS = 'ON_FETCH_CHALLENGES_FOR_TEAM_SUCCESS';
export const ON_FETCH_CHALLENGES_FOR_TEAM_ERROR = 'ON_FETCH_CHALLENGES_FOR_TEAM_ERROR';

export const ON_CHALLENGE_SELECTED = 'ON_CHALLENGE_SELECTED';
export const ON_IMAGE_SELECTED = 'ON_IMAGE_SELECTED';
export const ON_VIDEO_SELECTED = 'ON_VIDEO_SELECTED';
export const ON_POSTING_TEXT_CHANGED = 'ON_POSTING_TEXT_CHANGED';

export const ON_GET_CURRENT_POSITION_ERROR = 'ON_GET_CURRENT_POSITION_ERROR';
export const ON_GET_CURRENT_POSITION_SUCCESS = 'ON_GET_CURRENT_POSITION_SUCCESS';

export const ON_UPLOAD_POSTING_IN_PROGRESS = 'ON_UPLOAD_POSTING_IN_PROGRESS';
export const ON_UPLOAD_PROGRESS = 'ON_UPLOAD_PROGRESS';

export const ON_UPLOAD_POSTING_SUCCESS = 'ON_UPLOAD_POSTING_SUCCESS';
export const ON_UPLOAD_POSTING_ERROR = 'ON_UPLOAD_POSTING_ERROR';

export const ON_FULFILL_CHALLENGE_ERROR = 'ON_FULFILL_CHALLENGE_ERROR';

function uploadMedia(file, signedParams, onProgress) {

    if (!onProgress) {
        onProgress = () => {
        };
    }

    const uri = file.uri;
    const filetype = file.type || `video/${file.uri.split(".").pop()}`; // TODO: This should be improved

    return RNFetchBlob.fetch('POST', 'https://api.cloudinary.com/v1_1/breakout/auto/upload', {
        'Content-Type': 'multipart/form-data'
    }, [
        {
            name: 'api_key', data: CLOUDINARY_API_KEY
        }, {
            name: 'signature', data: signedParams.signature.toString()
        }, {
            name: 'timestamp', data: signedParams.timestamp.toString()
        }, {
            name: 'file', filename: 'test', type: filetype, data: RNFetchBlob.wrap(uri)
        }
    ])
        .uploadProgress(onProgress)
        .then(response => JSON.parse(response.data))
        .catch(err => {
            // TODO: Fetch blob doesn't properly throw errors when something went wrong for some reason...
            console.error(err);
            throw err;
        });
}

export function onCreatePostingPressed() {
    return async (dispatch, getState) => {
        const text = getState().createPosting.text;

        const latitude = _.get(getState(), 'createPosting.location.coords.latitude');
        const longitude = _.get(getState(), 'createPosting.location.coords.longitude');
        const media = _.get(getState(), 'createPosting.media');
        const challengeId = _.get(getState(), 'createPosting.selectedChallenge');

        dispatch(onUploadPostingInProgress());

        try {

            let imageParams;
            if (media) {
                const params = await withAccessToken(api).signCloudinaryParams();
                const {secure_url} = await uploadMedia(media, params, (a, b) => dispatch(onUploadProgress(a, b,)));
                imageParams = {
                    url: secure_url,
                    type: media.type ? 'image' : 'video'
                };
            }

            // build location if exists
            const location = (latitude && longitude) ? {latitude, longitude} : null;

            // upload posting

            const response = await withAccessToken(api).uploadPosting(text, location, imageParams);
            const postingId = response.id;

            // fulfill challenge if selected
            if (challengeId && challengeId !== -1) {
                try {
                    await withAccessToken(api).fullfillChallenge(challengeId, postingId)
                } catch (error) {
                    dispatch(onFulfillChallengeError(error))
                }
            }

            dispatch(onUploadPostingSuccess())
        } catch (error) {
            dispatch(onUploadPostingError(error))
        }
    }
}

function onUploadProgress(a, b) {
    return {
        type: ON_UPLOAD_PROGRESS,
        payload: {
            progress: a / b
        }
    }
}

function onFulfillChallengeError(error) {
    return {
        type: ON_FULFILL_CHALLENGE_ERROR,
        payload: {error}
    }
}

function onUploadPostingInProgress() {
    return {
        type: ON_UPLOAD_POSTING_IN_PROGRESS
    }
}

function onUploadPostingSuccess() {
    return {
        type: ON_UPLOAD_POSTING_SUCCESS,
    }
}

function onUploadPostingError(error) {
    return {
        type: ON_UPLOAD_POSTING_ERROR,
        payload: {error}
    }
}

export function onCreatePostingScreenMounted(teamId) {

    return async dispatch => {

        dispatch(clearState());

        let challenges;
        if (teamId) {
            try {
                challenges = await withAccessToken(api).fetchChallengesForTeam(teamId);
            } catch (error) {
                dispatch(onFetchChallengesForTeamError(error))
            }
        }

        let locations;
        try {
            const options = {
                maximumAge: 1000 * 60 * 20,
                enableHighAccuracy: true,
                timeout: 3000
            };
            locations = await new Promise((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject, options)
            });
        } catch (error) {
            dispatch(onGetCurrentPositionError(error))
        }

        if (locations) {
            dispatch(onGetCurrentPositionSuccess(locations));
        }
        if (challenges) {
            dispatch(onFetchChallengesForTeamSuccess(challenges));
        }
    };
}

function clearState() {
    return {
        type: 'CLEAR_STATE'
    }
}

function onGetCurrentPositionSuccess(location) {
    return {
        type: ON_GET_CURRENT_POSITION_SUCCESS,
        payload: {
            location
        }
    }
}

function onGetCurrentPositionError(error) {
    return {
        type: ON_GET_CURRENT_POSITION_ERROR,
        payload: {
            error
        }
    }
}

export function onChallengeSelected(challengeId) {
    return {
        type: ON_CHALLENGE_SELECTED,
        payload: {
            challengeId
        }
    }
}

export function onImageSelected(image) {
    return {
        type: ON_IMAGE_SELECTED,
        payload: {image}
    }
}

export function onVideoSelected(video) {
    return {
        type: ON_VIDEO_SELECTED,
        payload: {video}
    }
}

export function onPostingTextChanged(text) {
    return {
        type: ON_POSTING_TEXT_CHANGED,
        payload: {text}
    }
}

function onFetchChallengesForTeamSuccess(challenges) {
    return {
        type: ON_FETCH_CHALLENGES_FOR_TEAM_SUCCESS,
        // TODO: Filter me!
        payload: {challenges}
    }
}

function onFetchChallengesForTeamError(error) {
    return {
        type: ON_FETCH_CHALLENGES_FOR_TEAM_ERROR,
        payload: {error}
    }
}