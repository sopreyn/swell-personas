export interface Persona {
  id: string;
  name: string;
  summary: string;
  traits: string[];
  behavioralRules: string[];
  tells: string[];
  failureModes: string[];
}

export interface Scenario {
  id: string;
  title: string;
  setup: string;
  userRole: string;
}
