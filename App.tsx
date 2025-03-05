/* eslint-disable react-native/no-inline-styles */

import React from 'react';
import { useEffect, useState, useRef } from 'react';
import {
  SafeAreaView,
  Text,
  View,
} from 'react-native';
import { FlatList, TouchableOpacity, StyleSheet, TouchableWithoutFeedback } from 'react-native';
import FontAwesome6 from '@react-native-vector-icons/fontawesome6';
import { Alert } from 'react-native';


function App(): React.JSX.Element {
  const [categories, setCategories] = useState<string[]>([]);
  const [showJokes, setShowJokes] = useState<string[]>([]);
  const [jokesItem, setJokesItem] = useState<{ [key: string]: [] }>({});
  const [clickCount, setClickCount] = useState<{ [key: string]: number }>({});
  const flatListRef = useRef<FlatList>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchCategories = async () => {
    try {
      const url = 'https://v2.jokeapi.dev/categories';
      console.log(`url ${url}`);
      const response = await fetch(url);
      const data = await response.json();
      return data.categories;
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  };

  useEffect(() => {
    const getCategories = async () => {
      const data = await fetchCategories();
      setCategories(data);
    };
    getCategories();
  }, []);

  const fetchJokes = async (category: string) => {
    try {
      const url = `https://v2.jokeapi.dev/joke/${category}?type=single&amount=2`;
      console.log(`url ${url}`);
      const response = await fetch(url);
      const data = await response.json();
      return data.jokes;
    } catch (error) {
      console.error('Error fetching jokes:', error);
      return [];
    }
  };

  const toggleJokes = async (item: string) => {
    // console.log('jokesItem ' + JSON.stringify(jokesItem));
    if (jokesItem[item] == null) {
      const data = await fetchJokes(item);
      setJokesItem((prevJokes: any) => {
        var newJokes = { ...prevJokes };
        newJokes[item] = data;
        return newJokes;
      });
    }
    if (showJokes.includes(item)) {
      setShowJokes(showJokes.filter((i) => i !== item));
    } else {
      setShowJokes([...showJokes, item]);
    }
  };

  const moveItemToTop = (index: number) => {
    setCategories((prevCategories) => {
      const updatedCategories = [...prevCategories];
      const [selectedItem] = updatedCategories.splice(index, 1);
      updatedCategories.unshift(selectedItem);
      return updatedCategories;
    });
    flatListRef.current?.scrollToOffset({ animated: true, offset: 0 });

  };

  const addMoreData = async (item: string) => {
    const moreJokes = await fetchJokes(item);
    setJokesItem((prevJokes: any) => {
      var newJokes = { ...prevJokes };
      newJokes[item] = [...newJokes[item], ...moreJokes];
      return newJokes;
    });

    setClickCount((prevCount) => {
      const newCount = { ...prevCount };
      newCount[item] = (newCount[item] ?? 0) + 1;
      return newCount;
    });

  };

  const showDialog = (item: string) => {
    Alert.alert(
      '',
      `${item}`,
      [{ text: 'OK' }],
      { cancelable: true }
    );
  };


  const renderItem = ({ item, index }: { item: string, index: number }) => {
    return (
      <View>
        <TouchableWithoutFeedback onPress={() => toggleJokes(item)}>
          <View style={styles.itemContainer}>
            <Text style={{
              fontSize: 18,
              fontWeight: 'bold',
            }}>{index + 1}.</Text>
            <Text style={styles.itemText}>{item}</Text>
            {index !== 0 ? (
              <TouchableOpacity style={styles.button} onPress={() => moveItemToTop(index)}>
                <Text style={styles.buttonText}>Go Top</Text>
              </TouchableOpacity>) : (<View style={styles.buttonTop}><Text style={styles.buttonText}>Top</Text></View>)}

            <View style={styles.buttonIcon}>
              <FontAwesome6
                name={showJokes.includes(item) ? 'angle-up' : 'angle-down'}
                size={24}
                iconStyle={'solid'}
              />
            </View>
          </View>
        </TouchableWithoutFeedback>
        {showJokes.includes(item) && (
          <View style={styles.jokesContainer}>
            {jokesItem[item]?.map((joke: any, idx: number) => (
              <TouchableOpacity key={idx} onPress={() => showDialog(joke.joke)}>
                <Text style={styles.jokeText}>{joke.joke}</Text>
              </TouchableOpacity>
            ))}
            {(clickCount[item] === undefined || clickCount[item] < 2) && jokesItem[item]?.length > 0 && (<TouchableOpacity style={styles.buttonAddMore} onPress={() => addMoreData(item)}>
              <Text style={styles.buttonText}>Add More Data</Text>
            </TouchableOpacity>)}

          </View>
        )}
      </View>
    );
  };
  const styles = StyleSheet.create({
    itemContainer: {
      flexDirection: 'row',
      alignContent: 'flex-start',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor: '#ccc',
    },
    itemText: {
      marginLeft: 16,
      flex: 1,
      fontSize: 18,
      fontWeight: 'bold',
    },
    buttonsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 10,
    },
    buttonTop: {
      marginLeft: 16,
      backgroundColor: '#AAAAAA',
      padding: 10,
      borderRadius: 5,
    },
    buttonIcon: {
      marginLeft: 16,
      padding: 10,
    },
    buttonAddMore: {
      backgroundColor: '#007BFF',
      padding: 10,
      alignItems: 'center',
    },
    button: {
      marginLeft: 16,
      backgroundColor: '#007BFF',
      padding: 10,
      borderRadius: 5,
      alignItems: 'center',
    },
    buttonText: {
      color: 'white',
      fontWeight: 'bold',
    },
    jokesContainer: {
      marginTop: 10,
      marginLeft: 32,
    },
    jokeText: {
      fontSize: 16,
      color: '#555',
      borderBottomWidth: 1,
      borderBottomColor: '#ccc',
      paddingVertical: 10,
      paddingRight: 16,
    },
  });

  const onRefresh = async () => {
    const data = await fetchCategories();
    setCategories(data);
    setShowJokes([]);
    setJokesItem({});
    setClickCount({});
    setIsRefreshing(false);
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flex: 1, backgroundColor: 'white' }}>
        <Text style={{ textAlign: 'center', fontSize: 24, fontWeight: 'bold', margin: 20 }}>
          My Jakmall
        </Text>
        <FlatList
          ref={flatListRef}
          data={categories}
          renderItem={renderItem}
          keyExtractor={(item, index) => index.toString()}
          onRefresh={onRefresh}
          refreshing={isRefreshing}
        />
      </View>
    </SafeAreaView>
  );
}

export default App;
