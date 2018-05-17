import {applyMiddleware, combineReducers, createStore} from "redux";
import thunk from 'redux-thunk';
import {logger} from "redux-logger";
import locationReducer from '../locations/reducer';
import postingReducer from '../postings/reducer';
import loginReducer from '../login/reducer';
import teamProfileReducer from '../team-profile/reducer';
import createPostingReducer from '../create-posting/reducer';
import allTeamsReducer from '../all-teams/reducer';
import storage from 'redux-persist/lib/storage';
import {persistReducer, persistStore} from "redux-persist";

const persistConfig = {
    key: 'root',
    storage
};

const rootReducer = combineReducers({
    locations: locationReducer,
    postings: postingReducer,
    login: loginReducer,
    team: teamProfileReducer,
    createPosting: createPostingReducer,
    allTeams: allTeamsReducer
});

const persistedReducer = persistReducer(persistConfig, rootReducer);
export const store = createStore(persistedReducer, applyMiddleware(thunk, logger));
export const persistor = persistStore(store);

// persistor.purge();