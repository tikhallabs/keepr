import { createContext, useContext, useState } from 'react';

const PeopleContext = createContext(null);

export function PeopleProvider({ children }) {
  const [pendingPeople, setPendingPeople] = useState([]);

  function showPeopleBanner(people) {
    if (people.length > 0) setPendingPeople(people);
  }

  function clearPeopleBanner() {
    setPendingPeople([]);
  }

  return (
    <PeopleContext.Provider value={{ pendingPeople, showPeopleBanner, clearPeopleBanner }}>
      {children}
    </PeopleContext.Provider>
  );
}

export function usePeople() {
  return useContext(PeopleContext);
}
