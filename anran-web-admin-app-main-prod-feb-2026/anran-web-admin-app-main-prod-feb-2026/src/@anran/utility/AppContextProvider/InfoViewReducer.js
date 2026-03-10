export const InFoViewActions = {
  FETCH_STARTS: 'FETCH_STARTS',
  FETCH_SUCCESS: 'FETCH_SUCCESS',
  SET_MESSAGE: 'SET_MESSAGE',
  SET_ERROR: 'SET_ERROR',
  CLEAR_INFOVIEW: 'CLEAR_INFOVIEW',
  INVALID_TOKEN: 'INVALID_TOKEN',
};

export function contextReducer(state, action) {
  switch (action.type) {
    case InFoViewActions.FETCH_STARTS: {
      return {
        ...state,
        loading: true,
        displayMessage: '',
        error: '',
        logout: false,
      };
    }
    case InFoViewActions.FETCH_SUCCESS: {
      return {
        ...state,
        loading: false,
        displayMessage: '',
        error: '',
        logout: false,
      };
    }
    case InFoViewActions.SET_MESSAGE: {
      return {
        ...state,
        loading: false,
        displayMessage: action.payload,
        error: '',
        logout: false,
      };
    }
    case InFoViewActions.SET_ERROR: {
      return {
        ...state,
        loading: false,
        displayMessage: '',
        error: action.payload,
        logout: false,
      };
    }
    case InFoViewActions.CLEAR_INFOVIEW: {
      return {
        ...state,
        loading: false,
        displayMessage: '',
        error: '',
        logout: false,
      };
    }
    case InFoViewActions.INVALID_TOKEN: {
      return {
        ...state,
        loading: false,
        displayMessage: '',
        error: '',
        logout: true,
      };
    }
    default:
      return state;
  }
}
