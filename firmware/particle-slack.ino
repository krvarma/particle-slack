// This #include statement was automatically added by the Particle IDE.
#include "DHT.h"

#define MAX_ARGS        64

#define LIVING_ROOM     0
#define BEDROOM         1
#define KITCHEN         2

#define DOOR_PIN        D4
#define DHT_PIN         D5
#define DHT_TYPE        DHT22

int pins[] = {
    D1, D2, D3
};

char* rooms[] = {
    "Living Room",
    "Bedroom",
    "Kitchen"
};

bool shouldPublishState = false;
int prevDoorState = 0;
DHT dht(DHT_PIN, DHT_TYPE);
int temperature = 0;
int humidity = 0;

void publishEvent(char* pInfo){
    Particle.publish("pslack", pInfo);    
}

void publish(char* pFormat, ...){
    va_list arglist;
    char szInfo[32];
    
    va_start(arglist,pFormat);
    vsprintf(szInfo, pFormat, arglist);
    va_end(arglist);
    
    publishEvent(szInfo);
}

int getRoomTemperature(String args){
    int room = args.toInt();

    publish("%s Temperature is %d", rooms[room], temperature);
    
    return temperature;
}

int getRoomHumidity(String args){
    int room = args.toInt();

    publish("%s Humidity is %d", rooms[room], humidity);
    
    return humidity;
}

int controlLight(String args){
    int room = 1;
    int onoff = 0;
    char szArgs[MAX_ARGS];
    
    args.toCharArray(szArgs, MAX_ARGS);
    
    sscanf(szArgs, "%d,%d", &room, &onoff);
    
    int pin = pins[room];
    
    digitalWrite(pin, (onoff == 1 ? HIGH : LOW));
    
    publish("%s Light turned %s", rooms[room], (onoff == 1 ? "on" : "off"));
    
    return 0;
}

void preparePins(){
    int count = sizeof(pins) / sizeof(int);
    
    for(int index=0; index<count; ++index){
        pinMode(pins[index], OUTPUT);
    }
    
    pinMode(DHT_PIN, INPUT);
    pinMode(DOOR_PIN, INPUT);
}

void setup() {
    Serial.begin(115200);
    
    preparePins();
    
    dht.begin();
    
    Particle.function("getroomtemp", getRoomTemperature);
    Particle.function("getroomhumid", getRoomHumidity);
    Particle.function("ctrllight", controlLight);
}

void loop() {
    temperature = (int)dht.readTemperature();
    humidity = (int)dht.readHumidity();
    
    Serial.println();
    Serial.print("Temperature ");
    Serial.print(temperature);
    Serial.println();
    Serial.print("Humidity ");
    Serial.print(humidity);
    Serial.println();
    
    int doorState = digitalRead(DOOR_PIN);
    
    if(prevDoorState == -1){
        prevDoorState = doorState;
    }
    
    if(prevDoorState != doorState){
        char szInfo[32];
        
        Serial.print("Door State: ");
        Serial.println(prevDoorState);
        
        prevDoorState = doorState;
        
        
        publish("Front door is %s", (doorState == 1 ? "open" : "closeed"));
    }
    
    delay(100);
}