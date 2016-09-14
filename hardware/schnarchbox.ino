// This #include statement was automatically added by the Particle IDE.
#include "HttpClient/HttpClient.h"

// This #include statement was automatically added by the Particle IDE.
#include "SparkJson/SparkJson.h"

//JSON
StaticJsonBuffer<200> jsonBuffer;


char message_buff[100];
unsigned long lastTime = 0;

unsigned int nextTime = 0;    // Next time to contact the server
HttpClient http;

// Headers currently need to be set at init, useful for API keys etc.
http_header_t headers[] = {
    //  { "Content-Type", "application/json" },
    //  { "Accept" , "application/json" },
    { "Accept" , "*/*"},
    { NULL, NULL } // NOTE: Always terminate headers will NULL
};

http_request_t request;
http_response_t response; 

int timeArray[4] = {0,8,4,2};

int currentTime[4];

int numbers[10][8] = {
  {1,1,1,0,1,1,1,0},
  {0,0,1,0,0,1,0,0},
  {1,1,0,1,0,1,1,0},
  {1,0,1,1,0,1,1,0},
  {0,0,1,1,1,1,0,0},
  {1,0,1,1,1,0,1,0},
  {1,1,1,1,1,0,1,0},
  {0,0,1,0,0,1,1,0},
  {1,1,1,1,1,1,1,0},
  {1,0,1,1,1,1,1,0}    
};

int flatchPin = D5;
int fclockPin = D4;
int fdataPin = D3;

int slatchPin = D2;
int sclockPin = D1;
int sdataPin = D0;

boolean tmpAlarm = false;

boolean checkButton() {
    if(digitalRead(D6) == HIGH) {
        return true;
    } else {
        return false;
    }
}
                                
void performAlarm(int delayAlarm) {
    while(!checkButton()) {
        digitalWrite(D7, HIGH);
        delay(delayAlarm);
        digitalWrite(D7, LOW);
        delay(delayAlarm);
    }
}

void updateTime() {
  request.hostname = "node.rene-veenhuis.eu";
  request.port = 80;
  request.path = "/test.json";
  
  http.get(request, response, headers);
  
    /*String tmpDev = "{\"test\": \"helloWorld\",\"currentTime\":[12,12]}";*/
    /*String tmpDev = "{\"currentTime\":[15,57], \"alarm\": \"true\"}";*/
    String tmpDev = response.body;

    char charBuf[50];
    tmpDev.toCharArray(charBuf, 50);
    
    StaticJsonBuffer<200> jsonBuffer;
    
    JsonObject& root = jsonBuffer.parseObject(charBuf);
    
    const char* alarm = root["alarm"];
    int hour = root["currentTime"][0];
    int minute = root["currentTime"][1];

    if(hour < 10) {
        timeArray[0] = 0;
        timeArray[1] = hour;
    } else {
        timeArray[0] = (int)hour/10;
        timeArray[1] = (int)hour%10;
    }
    
    if(String(alarm).equals("true") && tmpAlarm != true){
        tmpAlarm = true;
        performAlarm(1000);
    }
    
    if(minute < 10) {
        timeArray[2] = 0;    
        timeArray[3] = minute;
    } else {
        timeArray[2] = (int)minute/10;
        timeArray[3] = (int)minute%10;
    }
    
    Particle.publish("JSON", alarm);
    Particle.publish("JSON", String(hour) + ":" + String(minute));
 
  Particle.publish("httpRequest", response.body);
}

// the setup function runs once when you press reset or power the board
void setup() {
  //Sound Pin
  pinMode(D7, OUTPUT);  
  //Button Pin
  pinMode(D6, INPUT);
    
  pinMode(flatchPin, OUTPUT);
  pinMode(fclockPin, OUTPUT);
  pinMode(fdataPin, OUTPUT);
  pinMode(slatchPin, OUTPUT);
  pinMode(sclockPin, OUTPUT);
  pinMode(sdataPin, OUTPUT);
  
  initial();
  
  updateTime();
  
  performAlarm(300);

}

void initial() {
    digitalWrite(D7, LOW);
    digitalWrite(flatchPin, LOW);
    digitalWrite(fclockPin, LOW);
    digitalWrite(fdataPin, LOW);
    digitalWrite(slatchPin, LOW);
    digitalWrite(sclockPin, LOW);
    digitalWrite(sdataPin, LOW);
    digitalWrite(D7, LOW);
}

void loop() {
    updateTime();
    
    for(int currentNumber = 3; currentNumber > 0; currentNumber--) {
        for(int i= 0; i<=1; i++) {
        for(int i = 0; i <= 7; i++) {
          int currentPin = 7 - i;
          if(numbers[timeArray[currentNumber]][currentPin] == 1) {
            digitalWrite(sdataPin, LOW);  //DATA
          } else {
            digitalWrite(sdataPin, HIGH);  //DATA
          }
          digitalWrite(sclockPin, HIGH);  //CLOCK
          digitalWrite(sclockPin, LOW);   //CLOCK
          digitalWrite(sdataPin, LOW);   //DATA   
          digitalWrite(slatchPin, HIGH);  //LATCH 
          digitalWrite(slatchPin, LOW);   //LATCH 
        }
        currentNumber--;
        }
        
        
        for(int i= 0; i<=1; i++) {
        for(int i = 0; i <= 7; i++) {
          int currentPin = 7 - i;
          if(numbers[timeArray[currentNumber]][currentPin] == 1) {
            digitalWrite(fdataPin, LOW);  //DATA
          } else {
            digitalWrite(fdataPin, HIGH);  //DATA
          }
          digitalWrite(fclockPin, HIGH);  //CLOCK
          digitalWrite(fclockPin, LOW);   //CLOCK
          digitalWrite(fdataPin, LOW);   //DATA   
          digitalWrite(flatchPin, HIGH);  //LATCH 
          digitalWrite(flatchPin, LOW);   //LATCH 
        }
        currentNumber--;
        }
        delay(1000);
    }
}
