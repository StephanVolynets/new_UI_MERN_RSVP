import React, { useState, useEffect } from "react";
import { ChakraProvider, Container, Heading, VStack, useToast } from "@chakra-ui/react";
import EventList from "./EventList";
import axios from "axios";
import theme from "./theme";

export default function App() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userRSVPs, setUserRSVPs] = useState({});
  const toast = useToast();

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const response = await axios.get("http://localhost:8080/api/events");
        setEvents(response.data);
        setError(null);
      } catch (err) {
        setError("Failed to load events");
        toast({
          title: "Error",
          description: "Failed to load events",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [toast]);

  const toggleRSVP = async (eventId) => {
    if (loading) return;

    const isRSVPed = userRSVPs[eventId];
    const action = isRSVPed ? "unrsvp" : "rsvp";

    setLoading(true);
    try {
      const response = await axios.post(
        `http://localhost:8080/api/events/${eventId}/headCount/${action}`
      );
      const updatedEvent = response.data;

      if (updatedEvent) {
        setEvents(events.map((event) => 
          event._id === eventId ? updatedEvent : event
        ));
        setUserRSVPs({ ...userRSVPs, [eventId]: !isRSVPed });
        
        toast({
          title: isRSVPed ? "RSVP Cancelled" : "RSVP Confirmed",
          description: isRSVPed ? "You've cancelled your RSVP" : "You're now registered for this event",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to update RSVP",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ChakraProvider theme={theme}>
      <Container maxW="container.xl" py={8}>
        <VStack spacing={8} align="stretch">
          <Heading textAlign="center" size="2xl" mb={2}>
            Event RSVP App
          </Heading>
          <Heading textAlign="center" size="md" color="gray.600" mb={8}>
            By Stephan Volynets
          </Heading>
          <EventList 
            events={events} 
            onRSVPToggle={toggleRSVP} 
            loading={loading}
            userRSVPs={userRSVPs}
          />
        </VStack>
      </Container>
    </ChakraProvider>
  );
}