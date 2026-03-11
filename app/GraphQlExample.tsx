import { graphqlApiLink } from "@/apollo";
import { gql } from "@apollo/client";
import { loadDevMessages, loadErrorMessages } from "@apollo/client/dev";
import { useMutation, useQuery } from "@apollo/client/react";
import { useTheme } from "@react-navigation/native";
import React, { memo } from "react";
import { Button, FlatList, Image, Text, View } from "react-native";
import createCommonStyles from "./commonStyles";

type CharactersResult = {
  characters: {
    results: Character[];
  };
};

type Character = {
  id: number;
  name: string;
  species: string;
  image: string;
};

if (__DEV__) {
  // Adds messages only in a dev environment
  loadDevMessages();
  loadErrorMessages();
}
/* ------------------ QUERY ------------------ */

const GET_CHARACTERS = gql`
  query {
    characters(page: 1) {
      results {
        id
        name
        species
        image
      }
    }
  }
`;

/* ------------------ LOCAL MUTATION ------------------ */

const ADD_FAVORITE = gql`
  mutation AddFavorite($name: String!) {
    addFavorite(name: $name) @client
  }
`;

/* ------------------ SUBSCRIPTION ------------------ */

const CHARACTER_EVENT = gql`
  subscription {
    characterEvent {
      message
    }
  }
`;

const ListItem = memo(
  ({ item, commonStyles, addFavorite }: { item: Character }) => (
    <View style={{ marginVertical: 20 }}>
      <View
        style={{
          padding: 20,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <View>
          <Text style={commonStyles.header}>{item.name}</Text>
          <Text style={commonStyles.text}>{item.species}</Text>
        </View>
        <Button
          title="Favorite"
          onPress={() =>
            addFavorite({
              variables: { name: item.name },
            })
          }
        />
      </View>

      <Image
        style={{ width: "100%", height: 300 }}
        source={{
          uri: item.image,
        }}
      />
    </View>
  ),
  (prevProps, nextProps) => {
    return prevProps.item.id === nextProps.item.id;
  },
);

export default function GraphQlExample() {
  const { loading, data } = useQuery<CharactersResult>(GET_CHARACTERS);
  const theme = useTheme();
  const commonStyles = createCommonStyles(theme);
  const [addFavorite] = useMutation(ADD_FAVORITE);

  // const { data: subData } = useSubscription(CHARACTER_EVENT);

  // useEffect(() => {
  //   // simulate subscription events
  //   const interval = setInterval(() => {
  //     console.log("Simulated subscription event");
  //   }, 5000);

  //   return () => clearInterval(interval);
  // }, []);

  if (loading) return <Text>Loading...</Text>;

  return (
    <View style={commonStyles.view}>
      {/* {subData && <Text style={{ marginBottom: 10 }}>Event: {subData.characterEvent.message}</Text>} */}
      <Text style={commonStyles.header}>Uses Rick&Morty GraphQL database:</Text>
      <Text style={commonStyles.text}>{graphqlApiLink}</Text>
      <FlatList
        initialNumToRender={2}
        windowSize={4}
        data={data?.characters.results ?? []}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => <ListItem item={item} addFavorite={addFavorite} commonStyles={commonStyles} />}
      />
    </View>
  );
}
