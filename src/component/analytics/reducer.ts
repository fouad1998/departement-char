export interface departementStackedGraphReducerInterface {
  readonly transferredChat: string;
  readonly unansweredChat: string;
  readonly answeredChat: string;
  readonly missedChat: string;
  readonly departementName: string;
  readonly hover: boolean;
  readonly seeDepartementInfo: boolean;
  readonly departementID: string;
}

export const departementStackedGraphReducer = (
  state: departementStackedGraphReducerInterface,
  action: any
): departementStackedGraphReducerInterface => {
  switch (action.type) {
    case 'SET_ALL':
      return { ...state, ...action.value };
    case 'SET_SELECTED_DEPARTEMENT':
      return { ...state, ...action.value };
    default:
      return state;
  }
};
