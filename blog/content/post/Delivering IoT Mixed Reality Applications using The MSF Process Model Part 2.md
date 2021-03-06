﻿+++
author = "Rahul Rai"
categories = ["azure", "internet-of-things","mixed-reality"]
date = "2018-07-03T00:00:00"
draft = false
tags = ["hololens", "azure", "learning","iot","agile"]
title = "Delivering IoT Mixed Reality Applications using The MSF Process Model (Develop and Stabilize) – Part 2"
type = "post"
attribution = "Reviewer: <b><a style='color:#33A6DC;' href='https://weblogs.asp.net/pglavich/'>Paul Glavich</a></b>"
+++

{{% notice %}}
In this series

1. [Envision and Plan](/post/Delivering-IoT-Mixed-Reality-Applications-using-The-MSF-Process-Model-Envision-and-Plan-Part-1/)
2. [Develop and Stabilize](/post/Delivering-IoT-Mixed-Reality-Applications-using-The-MSF-Process-Model-Develop-and-Stabilize-Part-2/)
3. [Develop, Stabilize, and Deploy](/post/Delivering-IoT-Mixed-Reality-Applications-using-The-MSF-Process-Model-Develop-Stabilize-and-Deploy-Part-3/)
   {{% /notice %}}
   In the [previous article](/post/Delivering-IoT-Mixed-Reality-Applications-using-The-MSF-Process-Model-Envision-and-Plan-Part-1/), we went through the Envisioning and Planning phases for delivering a Mixed Reality IoT application. In this article, we will start building the components of the architecture that we developed in the previous phase. Since we have a clear objective with all the plans laid out, let's kick off the development phase.

## Source Code

Before we start, I want to point you to the source code of the application that we are building. You can find the source code of this application in my GitHub repository.

{{< sourceCode src="https://github.com/rahulrai-in/FieldSensors" >}}

Inside the Unity folder, you will find the MR Application that renders the device telemetry and inside the VS folder, you will find the mock device and WebAPI that make up the backend of the system.

## Development Phase

In this phase, we will cater to a few of the scenarios identified for the first phase of development. Let's start with the user scenario that using the application, the user should be able to view a field and the sensors installed in it. On air-tapping a sensor hologram, the user should be able to see the last recorded telemetry generated by the sensor. To realize this scenario, we will carry out the following activities in this phase.

1. Build the hologram.
2. Build the backend infrastructure.
3. Build the Azure IoT solution.
4. Build the holographic application.
5. Connect the holographic app to Azure.
6. Configure and stabilize the connected holographic app.

### Building the hologram

In this phase, the 3D artists create 3D assets for the field and sensors from the 3D model sketch drawn by the artist. The 3D artists would supply us with [prefabs](https://docs.unity3d.com/Manual/Prefabs.html) that we can import in our application. As I am not an artist (at best I can draw stick men), I will use some of the assets from the Unity Store which are available for free. I have used a Unity Store asset for rendering the field landscape and used a 3D capsule asset for representing the sensors. Following is how our assets would look like in Unity. We will discuss building the MR app later in this article.

{{< img src="/Asset Placement in Unity.png" alt="Asset Placement in Unity" >}}

## Developing the Solution

Next, we are going to build an IoT solution, which receives data from connected devices, stores the data in Cosmos DB and exposes the data to the Holographic application through a WebAPI. We will start the process of building the solution by going through the Logical Design Diagram which presents all the components using the same architecture design that we previously developed.

{{< img src="/Logical Design Diagram.jpg" alt="Logical Design Diagram" >}}

We will use Event Hub instead of IoT Hub for this sample because our scenario requires only unidirectional message flow (device to the cloud). However, for enterprise scenarios, I recommend that you use IoTHub service which is built specifically for IoT device connectivity.

### Provisioning Backend Services

We will provision the following Azure services to build the ingestion and processing components of the solution.

1. **Azure Event Hub**
2. **Azure Cosmos DB**
3. **Azure Stream Analytics**

We will use the portal experience (https://portal.azure.com) to build all the services for this solution. However, for enterprise scenarios, you should invest time in developing [ARM templates](https://docs.microsoft.com/en-us/azure/azure-resource-manager/resource-group-authoring-templates) for provisioning the infrastructure. You should also try to consolidate all the resources in a single resource group to make managing the resources simpler. Following is a screenshot of the resources that I created in my Azure subscription.

{{< img src="/Resources in Resource Group.png" alt="Resources in Resource Group" >}}

### Provision Azure Event Hub

1. From **New**, select the **Event Hubs** services option and create a new Event Hub namespace by providing a name, resource group, and other required details.

2. Once the namespace is created, add a new Event Hub in the namespace by clicking on the **+** icon and then supplying the necessary information to provision the Event Hub.
   {{< img src="/Create Event Hub.jpg" alt="Create Event Hub" >}}

3. Once the Event Hub is created, open the Event Hub instance and navigate to **Settings** &rarr; **Shared Access Policies**.
4. Create a Policy by selecting all claims that are **Manage** , **Send** , and **Listen**.
5. Note down the connection string and event hub name for further reference.

### Create Azure Cosmos DB

Cosmos DB acts as a data store for the telemetry generated by the devices. To create an instance of Azure Cosmos DB, follow these steps.

1. From New, select **Azure Cosmos DB** service and create a new Cosmos DB by providing ID, resource group, location, and your subscription. Make sure that you select SQL as the query language from the API Dropdown:
2. Once the Azure Cosmos DB account is created, add a collection to it by clicking on the "**Add Collection**" button and add a database to it.
3. Note down the connection details for further reference, which you can get from **Settings** &rarr; **Keys**.
   {{< img src="/Cosmos DB Keys.png" alt="Cosmos DB Keys" >}}

### Create Stream Analytics Job

Stream Analytics Job takes in data from Event Hub, processes it, and transfers it to Cosmos DB. Follow these steps to provision a Stream Analytics job.

1. From **New** , select **Stream Analytics Job**. Enter necessary details such as job name, resource group, and others. Let the **number of streaming units** , which is the number of units required to process the query stay at its minimum value, i.e., 1.
2. Select the **Input** tab and add a new input of type **Event Hub** , apply connection settings to the Event Hub which you just created above.
   {{< img src="/Create Input for Stream Analytics.png" alt="Create Input for Stream Analytics" >}}

3. Select the **Output** tab and add a new output of type **DocumentDB**. Apply connection settings to connect to CosmosDB which you just created above.
   {{< img src="/Create Output for Stream Analytics.png" alt="Create Output for Stream Analytics" >}}

4. Select the **query** tab and add a pass-through query to connect the input and output streams that you just configured.
   {{< img src="/Create Stream Analytics Query.png" alt="Create Stream Analytics Query" >}}

5. From the **Overview** tab, start the job so that the Stream Analytics job begins processing data immediately.

### Building the Device Simulator

Now that we have provisioned the infrastructure and created the plumbing between all the systems, we now need to develop a mock device that sends telemetry to the EventHub. Once the data lands at the Event Hub, it will be pushed to our Cosmos DB instance by the Stream Analytics Job that we just provisioned.

In Visual Studio, create a new console application and add the following code in the **Program** file.

{{< gist rahulrai-in af55d099b8881018550364bddc5c00ea >}}

The code has a dependency on EventHub package, therefore, add the NuGet Package **Microsoft.Azure.EventHubs** to the project. Add two constant strings to define the Event Hub connection string and Event Hub name.

```CS
private const string EhConnectionString = "Endpoint=sb://EVENTHUBNAMESPACE.servicebus.windows.net/;SharedAccessKeyName=Key";

private const string EhEntityPath = "EVENT HUB NAME";
```

You can now execute the application and send telemetry data to EventHub. The Stream Analytics job will copy all the data that this device generates to Cosmos DB collection.

### Building the WebAPI

The WebAPI component queries the data stored in Cosmos DB and exposes a REST API which can be consumed by other applications. To create a Web API follow these steps:

1. Create a WebAPI project by selecting either the **Azure API App** or **Web API** project template.
2. Create a controller named **FieldSensorController**. Add the following code to the controller to fetch data from Cosmos DB and return it as a response to the request.
   {{< gist rahulrai-in afaacefc9a662ffbbbd32d094c3a74dd >}}

3. Publish your Web API to Azure. If you get stuck, follow the steps mentioned [here](https://docs.microsoft.com/en-us/azure/app-service/app-service-web-tutorial-dotnet-sqldatabase#publish-to-azure-with-sql-database).
4. You can test the response of the API by to the controller as shown below.
   {{< img src="/FieldSensor API Response.jpg" alt="FieldSensor API Response" >}}

Here is the format of response that you will receive in plain text.

```JSON
[
    {
        "Id": "1",
        "TimestampUtc": "2018-03-14T03:31:14.7994193Z",
        "Value": 54.227751239308972
    }
]
```

## Conclusion

In this post, we created and deployed the backend infrastructure for our IoT solution. In the next article, we will build a Mixed Reality application that will render the data that it consumes from the API. We will also discuss how we can deploy the Mixed Reality application using the various deployment mechanisms and how we can extend the application to support more usage scenarios.

{{< subscribe >}}
