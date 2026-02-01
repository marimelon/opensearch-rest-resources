"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("../src/resources/common");
test('recursive convert case', () => {
    // GIVEN
    const input = {
        someKey: '1',
        someNestedKey: {
            someChild: 'childValue',
            moreNestedKey: {
                someGrandChild: 1,
            },
        },
    };
    // WHEN
    const output = (0, common_1.recursiveFromCamelToSnake)(input);
    // THEN
    expect(output).toStrictEqual({
        some_key: '1',
        some_nested_key: {
            some_child: 'childValue',
            more_nested_key: {
                some_grand_child: 1,
            },
        },
    });
});
test('recursive convert case with exclude', () => {
    // GIVEN
    const input = {
        someNestedKey: {
            someChild: 'childValue',
            excludeKey: {
                someGrandChild: 1,
                moreNestedKey: {
                    keepCamelCase: 1,
                },
            },
        },
    };
    const exclude = { someNestedKey: { excludeKey: true } };
    // WHEN
    const output = (0, common_1.recursiveFromCamelToSnake)(input, exclude);
    // THEN
    expect(output).toStrictEqual({
        some_nested_key: {
            some_child: 'childValue',
            exclude_key: {
                someGrandChild: 1,
                moreNestedKey: {
                    keepCamelCase: 1,
                },
            },
        },
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tbW9uLnRlc3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi90ZXN0L2NvbW1vbi50ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsb0RBQW9FO0FBRXBFLElBQUksQ0FBQyx3QkFBd0IsRUFBRSxHQUFHLEVBQUU7SUFDbEMsUUFBUTtJQUNSLE1BQU0sS0FBSyxHQUFHO1FBQ1osT0FBTyxFQUFFLEdBQUc7UUFDWixhQUFhLEVBQUU7WUFDYixTQUFTLEVBQUUsWUFBWTtZQUN2QixhQUFhLEVBQUU7Z0JBQ2IsY0FBYyxFQUFFLENBQUM7YUFDbEI7U0FDRjtLQUNGLENBQUM7SUFFRixPQUFPO0lBQ1AsTUFBTSxNQUFNLEdBQUcsSUFBQSxrQ0FBeUIsRUFBQyxLQUFLLENBQUMsQ0FBQztJQUVoRCxPQUFPO0lBQ1AsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLGFBQWEsQ0FBQztRQUMzQixRQUFRLEVBQUUsR0FBRztRQUNiLGVBQWUsRUFBRTtZQUNmLFVBQVUsRUFBRSxZQUFZO1lBQ3hCLGVBQWUsRUFBRTtnQkFDZixnQkFBZ0IsRUFBRSxDQUFDO2FBQ3BCO1NBQ0Y7S0FDRixDQUFDLENBQUM7QUFDTCxDQUFDLENBQUMsQ0FBQztBQUVILElBQUksQ0FBQyxxQ0FBcUMsRUFBRSxHQUFHLEVBQUU7SUFDL0MsUUFBUTtJQUNSLE1BQU0sS0FBSyxHQUFHO1FBQ1osYUFBYSxFQUFFO1lBQ2IsU0FBUyxFQUFFLFlBQVk7WUFDdkIsVUFBVSxFQUFFO2dCQUNWLGNBQWMsRUFBRSxDQUFDO2dCQUNqQixhQUFhLEVBQUU7b0JBQ2IsYUFBYSxFQUFFLENBQUM7aUJBQ2pCO2FBQ0Y7U0FDRjtLQUNGLENBQUM7SUFDRixNQUFNLE9BQU8sR0FBRyxFQUFFLGFBQWEsRUFBRSxFQUFFLFVBQVUsRUFBRSxJQUFJLEVBQUUsRUFBVyxDQUFDO0lBRWpFLE9BQU87SUFDUCxNQUFNLE1BQU0sR0FBRyxJQUFBLGtDQUF5QixFQUFDLEtBQUssRUFBRSxPQUFPLENBQUMsQ0FBQztJQUV6RCxPQUFPO0lBQ1AsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLGFBQWEsQ0FBQztRQUMzQixlQUFlLEVBQUU7WUFDZixVQUFVLEVBQUUsWUFBWTtZQUN4QixXQUFXLEVBQUU7Z0JBQ1gsY0FBYyxFQUFFLENBQUM7Z0JBQ2pCLGFBQWEsRUFBRTtvQkFDYixhQUFhLEVBQUUsQ0FBQztpQkFDakI7YUFDRjtTQUNGO0tBQ0YsQ0FBQyxDQUFDO0FBQ0wsQ0FBQyxDQUFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyByZWN1cnNpdmVGcm9tQ2FtZWxUb1NuYWtlIH0gZnJvbSAnLi4vc3JjL3Jlc291cmNlcy9jb21tb24nO1xuXG50ZXN0KCdyZWN1cnNpdmUgY29udmVydCBjYXNlJywgKCkgPT4ge1xuICAvLyBHSVZFTlxuICBjb25zdCBpbnB1dCA9IHtcbiAgICBzb21lS2V5OiAnMScsXG4gICAgc29tZU5lc3RlZEtleToge1xuICAgICAgc29tZUNoaWxkOiAnY2hpbGRWYWx1ZScsXG4gICAgICBtb3JlTmVzdGVkS2V5OiB7XG4gICAgICAgIHNvbWVHcmFuZENoaWxkOiAxLFxuICAgICAgfSxcbiAgICB9LFxuICB9O1xuXG4gIC8vIFdIRU5cbiAgY29uc3Qgb3V0cHV0ID0gcmVjdXJzaXZlRnJvbUNhbWVsVG9TbmFrZShpbnB1dCk7XG5cbiAgLy8gVEhFTlxuICBleHBlY3Qob3V0cHV0KS50b1N0cmljdEVxdWFsKHtcbiAgICBzb21lX2tleTogJzEnLFxuICAgIHNvbWVfbmVzdGVkX2tleToge1xuICAgICAgc29tZV9jaGlsZDogJ2NoaWxkVmFsdWUnLFxuICAgICAgbW9yZV9uZXN0ZWRfa2V5OiB7XG4gICAgICAgIHNvbWVfZ3JhbmRfY2hpbGQ6IDEsXG4gICAgICB9LFxuICAgIH0sXG4gIH0pO1xufSk7XG5cbnRlc3QoJ3JlY3Vyc2l2ZSBjb252ZXJ0IGNhc2Ugd2l0aCBleGNsdWRlJywgKCkgPT4ge1xuICAvLyBHSVZFTlxuICBjb25zdCBpbnB1dCA9IHtcbiAgICBzb21lTmVzdGVkS2V5OiB7XG4gICAgICBzb21lQ2hpbGQ6ICdjaGlsZFZhbHVlJyxcbiAgICAgIGV4Y2x1ZGVLZXk6IHtcbiAgICAgICAgc29tZUdyYW5kQ2hpbGQ6IDEsXG4gICAgICAgIG1vcmVOZXN0ZWRLZXk6IHtcbiAgICAgICAgICBrZWVwQ2FtZWxDYXNlOiAxLFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICB9LFxuICB9O1xuICBjb25zdCBleGNsdWRlID0geyBzb21lTmVzdGVkS2V5OiB7IGV4Y2x1ZGVLZXk6IHRydWUgfSB9IGFzIGNvbnN0O1xuXG4gIC8vIFdIRU5cbiAgY29uc3Qgb3V0cHV0ID0gcmVjdXJzaXZlRnJvbUNhbWVsVG9TbmFrZShpbnB1dCwgZXhjbHVkZSk7XG5cbiAgLy8gVEhFTlxuICBleHBlY3Qob3V0cHV0KS50b1N0cmljdEVxdWFsKHtcbiAgICBzb21lX25lc3RlZF9rZXk6IHtcbiAgICAgIHNvbWVfY2hpbGQ6ICdjaGlsZFZhbHVlJyxcbiAgICAgIGV4Y2x1ZGVfa2V5OiB7XG4gICAgICAgIHNvbWVHcmFuZENoaWxkOiAxLFxuICAgICAgICBtb3JlTmVzdGVkS2V5OiB7XG4gICAgICAgICAga2VlcENhbWVsQ2FzZTogMSxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgfSxcbiAgfSk7XG59KTtcbiJdfQ==