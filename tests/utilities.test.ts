import {closestOnLineToPoint} from "utilities";


// ==========================================================================
describe("Closest point", function () {
    it("calculates closest point in diagonal line to circle", () => {
        const line = {from: {x: 10, y: 10}, to: {x: 40, y: 40}};
        let closestPoint;

        closestPoint = closestOnLineToPoint({x: 29, y: 31}, line);
        expect(closestPoint.x).toEqual(closestPoint.y);
        expect(closestPoint.x).toBeGreaterThan(28);
        expect(closestPoint.x).toBeLessThan(32);

        closestPoint = closestOnLineToPoint({x: 45, y: 49}, line);
        expect(closestPoint).toEqual({x: 40, y: 40});

        closestPoint = closestOnLineToPoint({x: -10, y: -10}, line);
        expect(closestPoint).toEqual({x: 10, y: 10});
    });

    it("calculates closest point on horizontal line to circle", () => {
        const line = {from: {x: 10, y: 10}, to: {x: 40, y: 10}};
        let closestPoint;

        closestPoint = closestOnLineToPoint({x: 22, y: 15}, line);
        expect(closestPoint).toEqual({x: 22, y: 10});

        closestPoint = closestOnLineToPoint({x: 45, y: 49}, line);
        expect(closestPoint).toEqual({x: 40, y: 10});

        closestPoint = closestOnLineToPoint({x: -10, y: 0}, line);
        expect(closestPoint).toEqual({x: 10, y: 10});
    });

    it("calculates closest point on vertical line to circle", () => {
        const line = {from: {x: 10, y: 10}, to: {x: 10, y: 30}};
        let closestPoint;

        closestPoint = closestOnLineToPoint({x: 22, y: 15}, line);
        expect(closestPoint).toEqual({x: 10, y: 15});

        closestPoint = closestOnLineToPoint({x: 45, y: 49}, line);
        expect(closestPoint).toEqual({x: 10, y: 30});

        closestPoint = closestOnLineToPoint({x: -1, y: -1}, line);
        expect(closestPoint).toEqual({x: 10, y: 10});
    });
});