import { useNavigation, useFocusEffect } from "@react-navigation/native";
import dayjs from "dayjs";
import { useCallback, useState } from "react";
import { Text, View, ScrollView, Alert } from "react-native";
import { DAY_SIZE, HabitDay } from "../components/HabitDay";
import { Header } from "../components/Header";
import { Loading } from "../components/Loading";
import { api } from "../lib/axios";
import { generateDatesFromYearBeginning } from "../utils/generateDatesFromYearBeginning";

const weekDays = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
const datesFromYearStart = generateDatesFromYearBeginning();
const minimumSummaryDatesSizes = 18 * 5;
const amountOfDaysToFill = minimumSummaryDatesSizes - datesFromYearStart.length;

type Summary = {
  id: string;
  date: string;
  amount: number;
  completed: number;
};

export function Home() {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<Summary[]>([]);

  const { navigate } = useNavigation();

  useFocusEffect(useCallback(() => {
    fetchData();
  }, []))

  async function fetchData() {
    try {
      setLoading(true);
      const response =  await api.get<Summary[]>('/summary');
      setSummary(response.data);
    }catch (error) {
      Alert.alert('Ops', 'Não foi possível carregar o sumário de hábitos.')
      console.log(error)
    } finally {
      setLoading(false);
    }
  }

  if(loading){
    return <Loading />;
  }


  return (
    <View className="flex-1 bg-background px-8 pt-16">
      <Header />

      <View className="flex-row mt-6 mb-2">
        {weekDays.map((weekDay, index) => (
          <Text 
            key={`${weekDay}-${index}`}
            className="text-zinc-400 text-xl font-bold text-center mx-1"
            style={{ width: DAY_SIZE }}
          >
            {weekDay}
          </Text>
        ))}
      </View>
      
      <ScrollView 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <View className="flex-row flex-wrap">
          {datesFromYearStart.map(date => {
            const dayWithHabits = summary.find(day => dayjs(date).isSame(day.date, 'day'));

            return (
              <HabitDay 
                key={date.toISOString()} 
                onPress={() => navigate('habit', { date: date.toISOString() })}
                date={date}
                amountOfHabits={dayWithHabits?.amount}
                amountCompleted={dayWithHabits?.completed}
              />
            );
          })}

          {amountOfDaysToFill > 0 && Array
            .from({length: amountOfDaysToFill})
            .map((_, index) => (
              <View
                key={index}
                className="bg-zinc-900 rounded-lg border-2 m-1 border-zinc-800 opacity-40"
                style={{ width: DAY_SIZE, height: DAY_SIZE }}
              >

              </View>
            ))
          }
        </View>
      </ScrollView>
    </View>
  )
}