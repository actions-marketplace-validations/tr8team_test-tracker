import { Ok } from "./core/result.js";
class HistoryService {
    #kv;
    constructor(kv) {
        this.#kv = kv;
    }
    inputArrayToHistoryEntry(input, sha, repoUrl, actionUrl) {
        return {
            sha,
            url: repoUrl,
            action: actionUrl,
            items: input,
        };
    }
    writeSHA(prefix, sha, entry) {
        const key = `${prefix}${sha}-commit.json`;
        return this.#kv.write(key, entry).asErr(null);
    }
    writePR(prefix, pr, entry) {
        const key = `${prefix}${pr.number}-pr.json`;
        return this.#kv
            .read(key)
            .map((histories) => histories.unwrapOr([]))
            .andThen((histories) => {
            const afterImage = [entry, ...histories];
            return this.#kv
                .write(key, afterImage)
                .asErr({ preImage: histories, afterImage });
        });
    }
    getBaseSHA(prefix, pr) {
        const key = `${prefix}${pr.baseSha}-commit.json`;
        return this.#kv.read(key);
    }
    async buildOutput(current, update, baseRef) {
        const b = await baseRef
            .map((base) => ({ base }))
            .unwrapOr({});
        return {
            current,
            ...b,
            ...update,
        };
    }
    store(inputs) {
        // generate entry
        const entry = this.inputArrayToHistoryEntry(inputs.data, inputs.sha, inputs.repoUrl, inputs.actionUrl);
        return (this
            // Write Single SHA to gist, regardless
            .writeSHA(inputs.prefix, inputs.sha, entry)
            .andThen(() => inputs.pr.match({
            // if not PR, ends
            none: Ok({ current: entry }),
            // If PR
            some: (pr) => {
                // Update PR History
                const update = this.writePR(inputs.prefix, pr, entry);
                // Get Base SHA
                const base = this.getBaseSHA(inputs.prefix, pr);
                // Merge Results
                return update.andThen((u) => base.map((b) => this.buildOutput(entry, u, b)));
            },
        })));
    }
}
export { HistoryService };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9saWIvc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQSxPQUFPLEVBQUUsRUFBRSxFQUFVLE1BQU0sa0JBQWtCLENBQUM7QUFlOUMsTUFBTSxjQUFjO0lBQ2xCLEdBQUcsQ0FBcUI7SUFFeEIsWUFBWSxFQUFzQjtRQUNoQyxJQUFJLENBQUMsR0FBRyxHQUFHLEVBQUUsQ0FBQztJQUNoQixDQUFDO0lBRUQsd0JBQXdCLENBQ3RCLEtBQWlCLEVBQ2pCLEdBQVcsRUFDWCxPQUFlLEVBQ2YsU0FBaUI7UUFFakIsT0FBTztZQUNMLEdBQUc7WUFDSCxHQUFHLEVBQUUsT0FBTztZQUNaLE1BQU0sRUFBRSxTQUFTO1lBQ2pCLEtBQUssRUFBRSxLQUFLO1NBQ2IsQ0FBQztJQUNKLENBQUM7SUFFRCxRQUFRLENBQ04sTUFBYyxFQUNkLEdBQVcsRUFDWCxLQUFtQjtRQUVuQixNQUFNLEdBQUcsR0FBRyxHQUFHLE1BQU0sR0FBRyxHQUFHLGNBQWMsQ0FBQztRQUMxQyxPQUFPLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDaEQsQ0FBQztJQUVELE9BQU8sQ0FDTCxNQUFjLEVBQ2QsRUFBTSxFQUNOLEtBQW1CO1FBRW5CLE1BQU0sR0FBRyxHQUFHLEdBQUcsTUFBTSxHQUFHLEVBQUUsQ0FBQyxNQUFNLFVBQVUsQ0FBQztRQUM1QyxPQUFPLElBQUksQ0FBQyxHQUFHO2FBQ1osSUFBSSxDQUFpQixHQUFHLENBQUM7YUFDekIsR0FBRyxDQUFDLENBQUMsU0FBUyxFQUFFLEVBQUUsQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxDQUFDO2FBQzFDLE9BQU8sQ0FBQyxDQUFDLFNBQVMsRUFBRSxFQUFFO1lBQ3JCLE1BQU0sVUFBVSxHQUFHLENBQUMsS0FBSyxFQUFFLEdBQUcsU0FBUyxDQUFDLENBQUM7WUFDekMsT0FBTyxJQUFJLENBQUMsR0FBRztpQkFDWixLQUFLLENBQUMsR0FBRyxFQUFFLFVBQVUsQ0FBQztpQkFDdEIsS0FBSyxDQUFDLEVBQUUsUUFBUSxFQUFFLFNBQVMsRUFBRSxVQUFVLEVBQUUsQ0FBQyxDQUFDO1FBQ2hELENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVELFVBQVUsQ0FBQyxNQUFjLEVBQUUsRUFBTTtRQUMvQixNQUFNLEdBQUcsR0FBRyxHQUFHLE1BQU0sR0FBRyxFQUFFLENBQUMsT0FBTyxjQUFjLENBQUM7UUFDakQsT0FBTyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBZSxHQUFHLENBQUMsQ0FBQztJQUMxQyxDQUFDO0lBRUQsS0FBSyxDQUFDLFdBQVcsQ0FDZixPQUFxQixFQUNyQixNQUEwQixFQUMxQixPQUE2QjtRQUU3QixNQUFNLENBQUMsR0FBRyxNQUFNLE9BQU87YUFDcEIsR0FBRyxDQUEwQixDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsQ0FBQyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7YUFDbEQsUUFBUSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ2hCLE9BQU87WUFDTCxPQUFPO1lBQ1AsR0FBRyxDQUFDO1lBQ0osR0FBRyxNQUFNO1NBQ1YsQ0FBQztJQUNKLENBQUM7SUFFRCxLQUFLLENBQUMsTUFBYztRQUNsQixpQkFBaUI7UUFDakIsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLHdCQUF3QixDQUN6QyxNQUFNLENBQUMsSUFBSSxFQUNYLE1BQU0sQ0FBQyxHQUFHLEVBQ1YsTUFBTSxDQUFDLE9BQU8sRUFDZCxNQUFNLENBQUMsU0FBUyxDQUNqQixDQUFDO1FBRUYsT0FBTyxDQUNMLElBQUk7WUFDRix1Q0FBdUM7YUFDdEMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUM7YUFDMUMsT0FBTyxDQUFDLEdBQUcsRUFBRSxDQUNaLE1BQU0sQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDO1lBQ2Qsa0JBQWtCO1lBQ2xCLElBQUksRUFBRSxFQUFFLENBQUMsRUFBRSxPQUFPLEVBQUUsS0FBSyxFQUFFLENBQUM7WUFDNUIsUUFBUTtZQUNSLElBQUksRUFBRSxDQUFDLEVBQUUsRUFBeUIsRUFBRTtnQkFDbEMsb0JBQW9CO2dCQUNwQixNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUUsRUFBRSxFQUFFLEtBQUssQ0FBQyxDQUFDO2dCQUN0RCxlQUFlO2dCQUNmLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBRSxFQUFFLENBQUMsQ0FBQztnQkFDaEQsZ0JBQWdCO2dCQUNoQixPQUFPLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUMxQixJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FDL0MsQ0FBQztZQUNKLENBQUM7U0FDRixDQUFDLENBQ0gsQ0FDSixDQUFDO0lBQ0osQ0FBQztDQUNGO0FBRUQsT0FBTyxFQUFFLGNBQWMsRUFBRSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgSW5wdXRzLCBQUiB9IGZyb20gXCIuL2ludGVyZmFjZS9pbnB1dC1yZXRyaWV2ZXIuanNcIjtcbmltcG9ydCB7IE9rLCBSZXN1bHQgfSBmcm9tIFwiLi9jb3JlL3Jlc3VsdC5qc1wiO1xuaW1wb3J0IHsgT3V0cHV0IH0gZnJvbSBcIi4vb3V0cHV0cy5qc1wiO1xuaW1wb3J0IHsgS2V5VmFsdWVSZXBvc2l0b3J5IH0gZnJvbSBcIi4vaW50ZXJmYWNlL3JlcG8uanNcIjtcbmltcG9ydCB7IEhpc3RvcnlFbnRyeSwgSW5wdXRBcnJheSB9IGZyb20gXCIuL2lucHV0cy5qc1wiO1xuaW1wb3J0IHsgT3B0aW9uIH0gZnJvbSBcIi4vY29yZS9vcHRpb24uanNcIjtcblxuaW50ZXJmYWNlIElIaXN0b3J5U2VydmljZSB7XG4gIHN0b3JlKGlucHV0OiBJbnB1dHMpOiBSZXN1bHQ8T3V0cHV0LCBFcnJvcj47XG59XG5cbmludGVyZmFjZSBVcGRhdGVIaXN0b3J5RW50cnkge1xuICBwcmVJbWFnZTogSGlzdG9yeUVudHJ5W107XG4gIGFmdGVySW1hZ2U6IEhpc3RvcnlFbnRyeVtdO1xufVxuXG5jbGFzcyBIaXN0b3J5U2VydmljZSBpbXBsZW1lbnRzIElIaXN0b3J5U2VydmljZSB7XG4gICNrdjogS2V5VmFsdWVSZXBvc2l0b3J5O1xuXG4gIGNvbnN0cnVjdG9yKGt2OiBLZXlWYWx1ZVJlcG9zaXRvcnkpIHtcbiAgICB0aGlzLiNrdiA9IGt2O1xuICB9XG5cbiAgaW5wdXRBcnJheVRvSGlzdG9yeUVudHJ5KFxuICAgIGlucHV0OiBJbnB1dEFycmF5LFxuICAgIHNoYTogc3RyaW5nLFxuICAgIHJlcG9Vcmw6IHN0cmluZyxcbiAgICBhY3Rpb25Vcmw6IHN0cmluZ1xuICApOiBIaXN0b3J5RW50cnkge1xuICAgIHJldHVybiB7XG4gICAgICBzaGEsXG4gICAgICB1cmw6IHJlcG9VcmwsXG4gICAgICBhY3Rpb246IGFjdGlvblVybCxcbiAgICAgIGl0ZW1zOiBpbnB1dCxcbiAgICB9O1xuICB9XG5cbiAgd3JpdGVTSEEoXG4gICAgcHJlZml4OiBzdHJpbmcsXG4gICAgc2hhOiBzdHJpbmcsXG4gICAgZW50cnk6IEhpc3RvcnlFbnRyeVxuICApOiBSZXN1bHQ8bnVsbCwgRXJyb3I+IHtcbiAgICBjb25zdCBrZXkgPSBgJHtwcmVmaXh9JHtzaGF9LWNvbW1pdC5qc29uYDtcbiAgICByZXR1cm4gdGhpcy4ja3Yud3JpdGUoa2V5LCBlbnRyeSkuYXNFcnIobnVsbCk7XG4gIH1cblxuICB3cml0ZVBSKFxuICAgIHByZWZpeDogc3RyaW5nLFxuICAgIHByOiBQUixcbiAgICBlbnRyeTogSGlzdG9yeUVudHJ5XG4gICk6IFJlc3VsdDxVcGRhdGVIaXN0b3J5RW50cnksIEVycm9yPiB7XG4gICAgY29uc3Qga2V5ID0gYCR7cHJlZml4fSR7cHIubnVtYmVyfS1wci5qc29uYDtcbiAgICByZXR1cm4gdGhpcy4ja3ZcbiAgICAgIC5yZWFkPEhpc3RvcnlFbnRyeVtdPihrZXkpXG4gICAgICAubWFwKChoaXN0b3JpZXMpID0+IGhpc3Rvcmllcy51bndyYXBPcihbXSkpXG4gICAgICAuYW5kVGhlbigoaGlzdG9yaWVzKSA9PiB7XG4gICAgICAgIGNvbnN0IGFmdGVySW1hZ2UgPSBbZW50cnksIC4uLmhpc3Rvcmllc107XG4gICAgICAgIHJldHVybiB0aGlzLiNrdlxuICAgICAgICAgIC53cml0ZShrZXksIGFmdGVySW1hZ2UpXG4gICAgICAgICAgLmFzRXJyKHsgcHJlSW1hZ2U6IGhpc3RvcmllcywgYWZ0ZXJJbWFnZSB9KTtcbiAgICAgIH0pO1xuICB9XG5cbiAgZ2V0QmFzZVNIQShwcmVmaXg6IHN0cmluZywgcHI6IFBSKTogUmVzdWx0PE9wdGlvbjxIaXN0b3J5RW50cnk+LCBFcnJvcj4ge1xuICAgIGNvbnN0IGtleSA9IGAke3ByZWZpeH0ke3ByLmJhc2VTaGF9LWNvbW1pdC5qc29uYDtcbiAgICByZXR1cm4gdGhpcy4ja3YucmVhZDxIaXN0b3J5RW50cnk+KGtleSk7XG4gIH1cblxuICBhc3luYyBidWlsZE91dHB1dChcbiAgICBjdXJyZW50OiBIaXN0b3J5RW50cnksXG4gICAgdXBkYXRlOiBVcGRhdGVIaXN0b3J5RW50cnksXG4gICAgYmFzZVJlZjogT3B0aW9uPEhpc3RvcnlFbnRyeT5cbiAgKTogUHJvbWlzZTxPdXRwdXQ+IHtcbiAgICBjb25zdCBiID0gYXdhaXQgYmFzZVJlZlxuICAgICAgLm1hcDx7IGJhc2U/OiBIaXN0b3J5RW50cnkgfT4oKGJhc2UpID0+ICh7IGJhc2UgfSkpXG4gICAgICAudW53cmFwT3Ioe30pO1xuICAgIHJldHVybiB7XG4gICAgICBjdXJyZW50LFxuICAgICAgLi4uYixcbiAgICAgIC4uLnVwZGF0ZSxcbiAgICB9O1xuICB9XG5cbiAgc3RvcmUoaW5wdXRzOiBJbnB1dHMpOiBSZXN1bHQ8T3V0cHV0LCBFcnJvcj4ge1xuICAgIC8vIGdlbmVyYXRlIGVudHJ5XG4gICAgY29uc3QgZW50cnkgPSB0aGlzLmlucHV0QXJyYXlUb0hpc3RvcnlFbnRyeShcbiAgICAgIGlucHV0cy5kYXRhLFxuICAgICAgaW5wdXRzLnNoYSxcbiAgICAgIGlucHV0cy5yZXBvVXJsLFxuICAgICAgaW5wdXRzLmFjdGlvblVybFxuICAgICk7XG5cbiAgICByZXR1cm4gKFxuICAgICAgdGhpc1xuICAgICAgICAvLyBXcml0ZSBTaW5nbGUgU0hBIHRvIGdpc3QsIHJlZ2FyZGxlc3NcbiAgICAgICAgLndyaXRlU0hBKGlucHV0cy5wcmVmaXgsIGlucHV0cy5zaGEsIGVudHJ5KVxuICAgICAgICAuYW5kVGhlbigoKSA9PlxuICAgICAgICAgIGlucHV0cy5wci5tYXRjaCh7XG4gICAgICAgICAgICAvLyBpZiBub3QgUFIsIGVuZHNcbiAgICAgICAgICAgIG5vbmU6IE9rKHsgY3VycmVudDogZW50cnkgfSksXG4gICAgICAgICAgICAvLyBJZiBQUlxuICAgICAgICAgICAgc29tZTogKHByKTogUmVzdWx0PE91dHB1dCwgRXJyb3I+ID0+IHtcbiAgICAgICAgICAgICAgLy8gVXBkYXRlIFBSIEhpc3RvcnlcbiAgICAgICAgICAgICAgY29uc3QgdXBkYXRlID0gdGhpcy53cml0ZVBSKGlucHV0cy5wcmVmaXgsIHByLCBlbnRyeSk7XG4gICAgICAgICAgICAgIC8vIEdldCBCYXNlIFNIQVxuICAgICAgICAgICAgICBjb25zdCBiYXNlID0gdGhpcy5nZXRCYXNlU0hBKGlucHV0cy5wcmVmaXgsIHByKTtcbiAgICAgICAgICAgICAgLy8gTWVyZ2UgUmVzdWx0c1xuICAgICAgICAgICAgICByZXR1cm4gdXBkYXRlLmFuZFRoZW4oKHUpID0+XG4gICAgICAgICAgICAgICAgYmFzZS5tYXAoKGIpID0+IHRoaXMuYnVpbGRPdXRwdXQoZW50cnksIHUsIGIpKVxuICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICB9KVxuICAgICAgICApXG4gICAgKTtcbiAgfVxufVxuXG5leHBvcnQgeyBIaXN0b3J5U2VydmljZSB9O1xuXG5leHBvcnQgdHlwZSB7IElIaXN0b3J5U2VydmljZSB9O1xuIl19