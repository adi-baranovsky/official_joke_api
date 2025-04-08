import { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";

const API_URL = "http://localhost:3005"; // URL of the API

function App() {
  const [jokeTypes, setJokeTypes] = useState([]); // All joke types
  const [selectedTypes, setSelectedTypes] = useState([]); // Types selected by the user
  const [jokes, setJokes] = useState([]); // All jokes combined, 10 jokes only

  // Fetch the joke types from the API
  useEffect(() => {
    document.title = "Jokes4U"; //title
    axios.get(`${API_URL}/types`)
      .then(response => setJokeTypes(response.data))
      .catch(error => console.error("Error fetching joke types:", error));
  }, []);

  // Fetch jokes based on the selected types
  const fetchJokes = async (types) => {
    const allJokes = [];
    for (const type of types) {
      try {
        const response = await axios.get(`${API_URL}/jokes/${type}/ten`);
        allJokes.push(...response.data);
      } catch (error) {
        console.error(`Error fetching jokes for type ${type}:`, error);
      }
    }
    setJokes(allJokes.slice(0, 10)); // Keep only 10 jokes in total
  };

  // Handle type selection by the user
  const handleTypeSelection = (type) => {
    setSelectedTypes(prevSelectedTypes => {
      const newSelectedTypes = prevSelectedTypes.includes(type)
        ? prevSelectedTypes.filter(selectedType => selectedType !== type)
        : [...prevSelectedTypes, type];
      fetchJokes(newSelectedTypes);
      return newSelectedTypes;
    });
  };

  // Replace a joke with a random one
  const replaceJoke = (jokeId) => {
    axios.get(`${API_URL}/random_joke`)
      .then(response => {
        setJokes(prevJokes => prevJokes.map(joke =>
          joke.id === jokeId ? { ...joke, setup: response.data.setup, punchline: response.data.punchline } : joke
        ));
      })
      .catch(error => console.error("Error replacing joke:", error));
  };

  // Replace a joke with another from the same category
  const replaceJokeInCategory = (jokeId, type) => {
    console.log(`Replacing joke from category ${type}...`);
    axios.get(`${API_URL}/jokes/${type}/random`)
      .then(response => {
        const newJoke = response.data && response.data[0];
        console.log("Received new joke:", newJoke);

        if (newJoke) {
          setJokes(prevJokes => prevJokes.map(joke =>
            joke.id === jokeId
              ? { ...joke, setup: newJoke.setup, punchline: newJoke.punchline }
              : joke
          ));
        } else {
          console.error("No joke found in the category");
        }
      })
      .catch(error => console.error("Error replacing joke in category:", error));
  };

  return (
    <div className="app-container">
      <h1>Select joke categories</h1>
      <div className="categories-container">
        {jokeTypes.map(type => (
          <button
            key={type}
            onClick={() => handleTypeSelection(type)}
            className={`category-btn ${selectedTypes.includes(type) ? "selected" : ""}`}
          >
            {type}
          </button>
        ))}
      </div>
  
      {selectedTypes.length > 0 && (
        <div className="jokes-section">
          <div className="jokes-container">
            {jokes.map(joke => (
              <div key={joke.id} className="joke-card">
                <p className="joke-text">{joke.setup}</p>
                <span className="joke-punchline">{joke.punchline}</span>
                <div className="joke-actions">
                  <button className="replace-btn" onClick={() => replaceJoke(joke.id)}>Random Joke</button>
                  <button className="replace-btn" onClick={() => replaceJokeInCategory(joke.id, joke.type)}>Same Category</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
