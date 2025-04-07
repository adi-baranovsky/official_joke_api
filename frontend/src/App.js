import { useEffect, useState } from "react";
import axios from "axios";

const API_URL = "http://localhost:3005"; // URL of the API

function App() {
  const [jokeTypes, setJokeTypes] = useState([]); // All joke types
  const [selectedTypes, setSelectedTypes] = useState([]); // Types selected by the user
  const [jokes, setJokes] = useState([]); // All jokes combined, 10 jokes only

  // Fetch the joke types from the API
  useEffect(() => {
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
        allJokes.push(...response.data); // Add jokes to the list
      } catch (error) {
        console.error(`Error fetching jokes for type ${type}:`, error);
      }
    }

    // We only want 10 jokes, so slice to the first 10
    setJokes(allJokes.slice(0, 10)); // Keep only 10 jokes in total
  };

  // Handle type selection by the user
  const handleTypeSelection = (type) => {
    setSelectedTypes(prevSelectedTypes => {
      const newSelectedTypes = prevSelectedTypes.includes(type)
        ? prevSelectedTypes.filter(selectedType => selectedType !== type) // Remove if already selected
        : [...prevSelectedTypes, type]; // Add if not selected
      fetchJokes(newSelectedTypes); // Fetch jokes again with updated types
      return newSelectedTypes;
    });
  };

  // Function to replace a specific joke with a random one from the API
  const replaceJoke = (jokeId) => {
    axios.get(`${API_URL}/random_joke`)
      .then(response => {
        // Update the jokes array by replacing the joke with the matching id
        setJokes(prevJokes => {
          const updatedJokes = prevJokes.map(joke =>
            joke.id === jokeId ? { ...joke, setup: response.data.setup, punchline: response.data.punchline } : joke
          );
          return updatedJokes;
        });
      })
      .catch(error => console.error("Error replacing joke:", error));
  };

  // Function to replace a specific joke with a new one from the same category
  const replaceJokeInCategory = (jokeId, type) => {
    console.log(`Replacing joke from category ${type}...`); // Added for debugging
    axios.get(`${API_URL}/jokes/${type}/random`) // Getting a random joke from the same category
      .then(response => {
        // Checking if we received an array and extracting the first item
        const newJoke = response.data && response.data[0]; // We expect the new joke to be the first item in the array
        console.log("Received new joke:", newJoke); // Log the new joke

        if (newJoke) {
          setJokes(prevJokes => {
            // Find the joke we want to replace and update it
            return prevJokes.map(joke => 
              joke.id === jokeId
                ? { ...joke, setup: newJoke.setup, punchline: newJoke.punchline } // Update only the matching joke
                : joke // Keep other jokes unchanged
            );
          });
        } else {
          console.error("No joke found in the category");
        }
      })
      .catch(error => {
        console.error("Error replacing joke in category:", error);
      });
  };

  return (
    <div>
      <h1>Select joke categories</h1>
      <div>
        {/* Render buttons for each joke type */}
        {jokeTypes.map(type => (
          <button
            key={type}
            onClick={() => handleTypeSelection(type)}
            style={{
              backgroundColor: selectedTypes.includes(type) ? "green" : "lightgray"
            }}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Display jokes when types are selected */}
      {selectedTypes.length > 0 && (
        <div>
          <h2>Jokes from selected categories:</h2>
          <ul>
            {/* Render jokes with unique keys based on their id */}
            {jokes.map(joke => (
              <li key={joke.id}>
                {joke.setup} - {joke.punchline}
                <br />
                <button onClick={() => replaceJoke(joke.id)}>Replace with random joke</button>
                <button onClick={() => replaceJokeInCategory(joke.id, joke.type)}>Replace with joke from the same category</button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default App;
