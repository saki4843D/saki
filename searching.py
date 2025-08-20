arr = [1, 2, 3, 4, 5, 6]
def linear_search(arr, target):
    for i in range(len(arr)):
        if arr[i] == target:
            return i
    return -1
target = 4
result = linear_search(arr, target)
if result != -1:
    print("Element Found at index", result)
else:
    print("Element Not Found")

arr = [1, 2, 3, 4, 5, 6]
def binary_search(arr, target):
    low = 0
    high = len(arr)-1

    while low <= high:
        mid = (low + high) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
             low = mid + 1
        else:
            high = mid - 1
    return -1  
target = 5
result = binary_search(arr, target)
if result != -1:
    print("Element found at index", result)
else:
    print("Element Not Found")
