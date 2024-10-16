export interface Collaborator {
  email:            string;
  id:               string;
  nickName:         string;
  role:             string;
  linked?:          string;
  userId?:          string;
  UID:              string;
  accessTo:     AccessTo[];
  password?:        string;
}

interface AccessTo {
  email:            string;
  id:               string;
  nickName:         string;
}