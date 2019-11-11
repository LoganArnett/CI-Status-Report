export interface CircleCIStep {
  failed: boolean;
  output_url: string;
}

export interface CircleCIStepAction {
  actions: CircleCIStep[];
}
