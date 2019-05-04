﻿+++
author = "Rahul Rai"
categories = ["cloud-patterns"]
date = "2016-11-21T00:00:00"
draft = false
tags = ["distributed computing", "patterns", "reflection", "dynamic"]
title = "Patterns for Asynchronous Services: Dynamic Property Value Reader"
type = "post"
+++

Next in our series of patterns, we will discuss a problem that almost all of us have encountered and solved in a less than desirable manner almost every time. Today, we will talk about using reflection. Most of the applications use reflection to read values out of an unknown type of object. I will present you with a utility that helps you do just that with little performance implications using input that you can store in configuration files or your application's database. You can use this utility to read values of nested properties and extract filtered values out of lists using a much more developer\user friendly format of input. This use of this utility is even more pronounced in asynchronous services because you might not have or might not wish to use strongly typed contracts to communicate with other services. A change in a non neessary contract property should not break your system. You can avoid such failures by extracting the required information from service response rather than casting the response to a predefined type.

## Dynamic Property Value Reader

#### Example Scenario

You are building a solution that requires you to parse different properties of objects based on configurations. You cannot possibly create a static parser for all available combinations of configurations, therefore you want to make the property parser driven through configurations. However, [reflection](<https://msdn.microsoft.com/en-us/library/f7ykdhsy(v=vs.110).aspx>) in .net does not offer you the flexibility of accepting a string filter as input and extracting the relevant property value out of an object. Therefore, you need to build a custom property parser that can help you derive values out of objects using a string filter as input.

#### Scenario

Some scenarios where this pattern is applicable are:

1. You want to parse objects with easy to understand input.
2. You want to run simple filter queries on lists.
3. You want to maintain readability of the input while parsing deep nested objects.

#### Solution

In essence, this is a utility function of recursive nature. When given an input, it recursively makes calls to itself to dig deeper into the object if the target object is deeply nested. It can run simple filter conditions on lists for which currently only the **equals** operator is supported. However, you can add support for more operators as per your needs. The beauty of this utility lies in the intuitive string input that it accepts which can be easily configured and stored in a database or a configuration file.

#### Source Code

You can download the source code of the implementation from my GitHub repository here.
{{< sourceCode src="https://github.com/rahulrai-in/DynamicPropertyValueReader" >}}

#### Executing the Sample

Download the sample and open it in your Visual Studio. To test this function, I have created a complex object with nested lists and objects through this code:

```CS
var complexList = CreateAnonymousList(new { Name = "SomeElementName", Value = "SomeElementValue" });
complexList.Add(new { Name = "AnotherElementName", Value = "AnotherElementValue" });
var testObject =
    new
        {
            SimpleProperty = "Some Value",
            ListProperty = complexList,
            SimpleListProperty = new List<int> { 1, 2, 3 },
            NesTedObject =
                new
                    {
                        AnotherNestedObject =
                            new
                                {
                                    YetAnotherNestedObject = new { NestedProperty = "SuperNestedPropertyValue" }
                                }
                    }
        };
```

Next, the retrieval of values of various objects happens in a straightforward manner as shown in the code below.

```CS
Console.WriteLine(
    "Getting value of SimpleProperty: "
    + DynamicPropertyValueReader.GetPropertyValue(testObject, "SimpleProperty"));
Console.WriteLine(
    "Getting value of SimpleListProperty: "
    + (DynamicPropertyValueReader.GetPropertyValue(testObject, "SimpleListProperty") as IEnumerable<int>)
            .First());

//// Simple filter on list
Console.WriteLine(
    "Getting value of ListProperty through a simple filter: "
    + DynamicPropertyValueReader.GetPropertyValue(testObject, "ListProperty[Name==SomeElementName].Value"));

Console.WriteLine(
    "Getting value of ListProperty through a simple filter: "
    + DynamicPropertyValueReader.GetPropertyValue(
        testObject, "ListProperty[Value==AnotherElementValue].Name"));

var returnedValue = DynamicPropertyValueReader.GetPropertyValue(
    testObject, "ListProperty[Value==asda].Name");
if (returnedValue == null)
{
    Console.WriteLine("No values matched this filter");
}

try
{
    DynamicPropertyValueReader.GetPropertyValue(testObject, "NotAvailableProperty");
}
catch (KeyNotFoundException exception)
{
    Console.WriteLine("The property was not found");
}

////NestedObject
Console.WriteLine(
    "Getting value of ListProperty through a simple filter: "
    + DynamicPropertyValueReader.GetPropertyValue(
        testObject, "NesTedObject.AnotherNestedObject.YetAnotherNestedObject").NestedProperty);
```

I hope that this pattern has proved useful to you. The next time you need to use reflection, don't settle for a less than idle solution.

{{< subscribe >}}
